# AWS デプロイガイド（Terraform + AWS CLI）

**プロジェクト:** タスクボード  
**対象読者:** AWS・Terraform・IaC 未経験者  
**最終更新:** 2026-06-04

---

## 目次

1. [概念解説：IaC・Terraform・AWS](#1-概念解説)
2. [AWS 無料枠構成と料金](#2-aws-無料枠構成と料金)
3. [前提ツールのインストール](#3-前提ツールのインストール)
4. [AWS アカウントと認証設定](#4-aws-アカウントと認証設定)
5. [Terraform 基礎知識](#5-terraform-基礎知識)
6. [このプロジェクトのインフラ設計](#6-このプロジェクトのインフラ設計)
7. [デプロイ全体フロー](#7-デプロイ全体フロー)
8. [実装ステップ詳細](#8-実装ステップ詳細)
9. [トラブルシューティング](#9-トラブルシューティング)
10. [参考リンク](#10-参考リンク)

---

## 1. 概念解説

### 1.1 IaC（Infrastructure as Code）とは

IaC とは **「インフラの構成をコードで定義・管理する手法」** のこと。

#### 従来の方法（手動）

```
1. AWS マネジメントコンソールにログイン
2. EC2 の設定画面をポチポチ操作
3. RDS の設定画面をポチポチ操作
4. セキュリティグループを手動で設定
→ 作業記録が残らない、再現性がない、チームで共有できない
```

#### IaC の方法

```
1. インフラ構成をコードファイル（.tf）に記述
2. コマンド 1 つで自動構築
→ Git 管理できる、何度でも同じ環境を再現できる、AI に書かせられる
```

#### IaC のメリット

| 項目 | 手動 | IaC |
|------|------|-----|
| 再現性 | 低い（手順書が必要） | 高い（コードが手順書） |
| 変更管理 | 難しい | Git で差分管理 |
| チーム共有 | 難しい | コードレビュー可能 |
| 自動化 | 難しい | CI/CD に組み込める |
| ドリフト検知 | できない | `terraform plan` で検知 |

---

### 1.2 Terraform とは

HashiCorp 社が開発した IaC ツール。  
**HCL（HashiCorp Configuration Language）** という独自言語でインフラを定義する。

```hcl
# EC2 インスタンスを 1 台作る例
resource "aws_instance" "web_server" {
  ami           = "ami-0c55b159cbfafe1f0"  # OS のイメージ
  instance_type = "t2.micro"               # サーバーのスペック

  tags = {
    Name = "taskboard-backend"
  }
}
```

このコードを書いて `terraform apply` を実行するだけで EC2 が作られる。

#### Terraform の主要コマンド

| コマンド | 意味 |
|---------|------|
| `terraform init` | 初期化（プラグインのダウンロード） |
| `terraform plan` | 変更内容のプレビュー（実際には何もしない） |
| `terraform apply` | 実際にリソースを作成・変更 |
| `terraform destroy` | 作成したリソースをすべて削除 |
| `terraform state list` | 管理中のリソース一覧 |

#### 宣言的 vs 手続き的

Terraform は **宣言的（Declarative）** なツール。

- **手続き的**：「サーバーを起動して、ネットワークに接続して、...」（How を書く）
- **宣言的**：「この状態にしてほしい」（What を書く）→ Terraform が差分を自動計算

---

### 1.3 AWS の主要サービス（このプロジェクトで使うもの）

| サービス | 役割 | たとえ |
|---------|------|--------|
| **VPC** | プライベートネットワーク | 会社の専用内線ネットワーク |
| **EC2** | 仮想サーバー（VM） | レンタルサーバー |
| **RDS** | マネージド DB | DB 専用のレンタルサーバー |
| **S3** | オブジェクトストレージ | 容量無制限のクラウドストレージ |
| **CloudFront** | CDN（コンテンツ配信ネットワーク） | 世界中のキャッシュサーバー |
| **Security Group** | ファイアウォール | どの通信を許可するかのルール |
| **IAM** | 権限管理 | 社員の役職・アクセス権限 |

---

### 1.4 リージョンとアベイラビリティゾーン（AZ）

```
リージョン（ap-northeast-1 = 東京）
├── AZ a（ap-northeast-1a）← 物理的に別のデータセンター
├── AZ c（ap-northeast-1c）
└── AZ d（ap-northeast-1d）
```

- **リージョン**：地理的なデータセンターの集合（東京、大阪、バージニア等）
- **AZ**：リージョン内の独立したデータセンター（電源・ネットワークが別々）
- 複数 AZ を使うと片方が落ちても継続稼働できる（冗長構成）

---

## 2. AWS 無料枠構成と料金

### 2.1 AWS 無料枠とは

新規 AWS アカウントに付与される **12 ヶ月間の無料利用枠**。  
（一部サービスは期間無制限で無料）

### 2.2 このプロジェクトの無料枠構成

```
インターネット
     │
     ▼
[CloudFront] ─────────────────────────────────────
     │                                              │
     ▼                                              ▼
[S3 バケット]                           [EC2 t2.micro]
React ビルド済みファイル                Spring Boot :8080
（静的ホスティング）                          │
                                              ▼
                                    [RDS db.t3.micro]
                                    PostgreSQL :5432
                                    （プライベートサブネット）
```

| サービス | スペック | 無料枠 | 超過時の料金 |
|---------|---------|--------|------------|
| **EC2** | t2.micro（1vCPU, 1GB RAM） | 750 時間/月（12 ヶ月） | $0.0116/時間 |
| **RDS** | db.t3.micro（2vCPU, 1GB RAM）20GB SSD | 750 時間/月（12 ヶ月） | $0.026/時間 |
| **S3** | 標準ストレージ | 5GB/月（12 ヶ月） | $0.025/GB |
| **CloudFront** | データ転送 | 1TB/月（12 ヶ月） | $0.014/GB |
| **VPC** | - | 無制限（無料） | - |

> **注意**：無料枠は 12 ヶ月で終了する。使わないリソースは `terraform destroy` で削除すること。

### 2.3 有料になるものを避ける設計

| 有料サービス | 月額 | 代替手段 |
|------------|------|---------|
| ALB（ロードバランサー） | ~$16 | EC2 に直接アクセス |
| ECS Fargate | ~$15 | EC2 t2.micro（無料枠） |
| NAT Gateway | ~$32 | パブリックサブネットに EC2 を配置 |
| Elastic IP | $3.6（未使用時） | EC2 の Public IP を使用 |

---

## 3. 前提ツールのインストール

### 3.1 macOS（Homebrew 使用）

```bash
# Homebrew がない場合はインストール
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# AWS CLI v2
brew install awscli
aws --version
# 期待出力: aws-cli/2.x.x Python/3.x.x ...

# Terraform
brew tap hashicorp/tap
brew install hashicorp/tap/terraform
terraform --version
# 期待出力: Terraform v1.x.x

# Docker（EC2 上での Docker 実行に必要）
brew install --cask docker
# Docker Desktop を起動してから確認
docker --version
```

### 3.2 バージョン要件

| ツール | 最小バージョン |
|--------|-------------|
| AWS CLI | 2.0 以上 |
| Terraform | 1.5 以上 |
| Docker | 24.0 以上 |
| Java | 21 以上（ローカルビルド用） |
| Node.js | 18 以上 |

---

## 4. AWS アカウントと認証設定

### 4.1 AWS アカウントの作成

1. https://aws.amazon.com/jp/ にアクセス
2. 「無料アカウントを作成」をクリック
3. メールアドレス・パスワード・クレジットカードを登録
4. 電話番号による本人確認を完了

> **重要**：ルートアカウント（登録メールアドレス）は管理者操作以外に使わない。  
> 日常の作業は IAM ユーザーを作成して行う。

---

### 4.2 IAM ユーザーの作成（AWS CLI で実行）

#### なぜ IAM ユーザーが必要か

```
ルートアカウント = 全権限（クレジットカード変更・アカウント削除も可能）
IAM ユーザー   = 必要な権限だけを付与した作業用アカウント

→ 万が一 IAM ユーザーの認証情報が漏洩しても、
  ルートアカウントへの影響を最小化できる
```

#### 手順（ルートアカウントで AWS CLI を一時設定後に実行）

```bash
# ステップ 1: ルートアカウントでアクセスキーを取得
# マネジメントコンソール → 右上のアカウント名 → セキュリティ認証情報
# → アクセスキー → アクセスキーを作成

# ステップ 2: ルートアカウントで一時設定
aws configure --profile root
# AWS Access Key ID: <ルートのキー>
# AWS Secret Access Key: <ルートのシークレット>
# Default region name: ap-northeast-1
# Default output format: json

# ステップ 3: Terraform 用 IAM ユーザーを作成
aws iam create-user \
  --user-name terraform-deployer \
  --profile root

# ステップ 4: AdministratorAccess ポリシーをアタッチ
# （学習用。本番では最小権限ポリシーを設計すること）
aws iam attach-user-policy \
  --user-name terraform-deployer \
  --policy-arn arn:aws:iam::aws:policy/AdministratorAccess \
  --profile root

# ステップ 5: アクセスキーを作成（出力を必ず保存）
aws iam create-access-key \
  --user-name terraform-deployer \
  --profile root
```

出力例：
```json
{
    "AccessKey": {
        "UserName": "terraform-deployer",
        "AccessKeyId": "AKIAIOSFODNN7EXAMPLE",
        "Status": "Active",
        "SecretAccessKey": "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY",
        "CreateDate": "2026-06-04T00:00:00Z"
    }
}
```

> **重要**：`SecretAccessKey` は作成時の 1 回しか表示されない。必ず安全な場所に保存すること。

---

### 4.3 AWS CLI に IAM ユーザーを設定

```bash
# terraform-deployer プロファイルとして設定
aws configure --profile terraform-deployer
# AWS Access Key ID: AKIAIOSFODNN7EXAMPLE
# AWS Secret Access Key: wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
# Default region name: ap-northeast-1
# Default output format: json

# 設定確認
aws sts get-caller-identity --profile terraform-deployer
```

期待する出力：
```json
{
    "UserId": "AIDAIOSFODNN7EXAMPLE",
    "Account": "123456789012",
    "Arn": "arn:aws:iam::123456789012:user/terraform-deployer"
}
```

### 4.4 デフォルトプロファイルとして設定（オプション）

```bash
# 環境変数でプロファイルを指定（ターミナルセッション内で有効）
export AWS_PROFILE=terraform-deployer

# または ~/.aws/config で default を変更
# ~/.aws/credentials ファイルの確認
cat ~/.aws/credentials
```

---

### 4.5 認証情報の保管場所

```
~/.aws/
├── credentials  ← アクセスキー・シークレットキーが保存される
└── config       ← リージョン・出力形式が保存される
```

> **セキュリティ注意**：
> - `~/.aws/credentials` は Git にコミットしない
> - EC2 上では IAM Role を使う（認証情報をファイルに置かない）
> - アクセスキーは定期的にローテーションする

---

## 5. Terraform 基礎知識

### 5.1 Terraform のファイル構成

```
terraform/
├── main.tf           ← プロバイダー設定・基本設定
├── variables.tf      ← 変数の定義（型・デフォルト値・説明）
├── outputs.tf        ← 作成後に出力する値（IP アドレスなど）
├── vpc.tf            ← ネットワーク設定
├── security_groups.tf← ファイアウォールルール
├── ec2.tf            ← バックエンドサーバー
├── rds.tf            ← データベース
├── s3.tf             ← フロントエンドファイル置き場
├── cloudfront.tf     ← CDN 設定
├── terraform.tfvars  ← 変数の実際の値（Git 管理しない）
└── .terraform/       ← Terraform が自動生成（Git 管理しない）
```

### 5.2 基本的な HCL の書き方

```hcl
# ─── プロバイダーの設定 ───
# どのクラウドを使うかを宣言する
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region  = "ap-northeast-1"
  profile = "terraform-deployer"  # AWS CLI のプロファイル名
}

# ─── リソースブロック ───
# resource "サービス種別" "このコード内での名前" { ... }
resource "aws_vpc" "main" {
  cidr_block = "10.0.0.0/16"

  tags = {
    Name = "taskboard-vpc"
  }
}

# ─── 変数の使い方 ───
variable "environment" {
  type        = string
  default     = "production"
  description = "環境名（development / staging / production）"
}

resource "aws_s3_bucket" "frontend" {
  bucket = "taskboard-frontend-${var.environment}"
}

# ─── 他リソースの参照 ───
resource "aws_subnet" "public" {
  vpc_id     = aws_vpc.main.id  # aws_vpc.main リソースの id を参照
  cidr_block = "10.0.1.0/24"
}

# ─── アウトプット ───
output "frontend_url" {
  value       = "https://${aws_cloudfront_distribution.frontend.domain_name}"
  description = "フロントエンドの URL"
}
```

### 5.3 terraform.tfstate とは

Terraform が管理するリソースの現在状態を記録するファイル。

```json
// terraform.tfstate（自動生成）
{
  "resources": [
    {
      "type": "aws_vpc",
      "name": "main",
      "instances": [
        {
          "attributes": {
            "id": "vpc-12345678",
            "cidr_block": "10.0.0.0/16"
          }
        }
      ]
    }
  ]
}
```

> **重要**：
> - `terraform.tfstate` には秘密情報が含まれる場合がある → Git にコミットしない
> - チームで使う場合は S3 バケットにリモート保存する（今回は省略）

---

## 6. このプロジェクトのインフラ設計

### 6.1 全体アーキテクチャ

```
                        インターネット
                             │
                    ┌────────┴────────┐
                    │   CloudFront    │
                    │  (CDN・HTTPS化) │
                    └────────┬────────┘
                             │
              ┌──────────────┴──────────────┐
              │                             │
    ┌─────────┴──────────┐     ┌────────────┴───────────┐
    │       S3           │     │      EC2 t2.micro       │
    │ React 静的ファイル  │     │   Spring Boot :8080     │
    │ (ビルド済み HTML,  │     │ (パブリックサブネット)   │
    │  CSS, JS)          │     └────────────┬───────────┘
    └────────────────────┘                  │
                                            │ JDBC
                               ┌────────────┴───────────┐
                               │    RDS db.t3.micro      │
                               │    PostgreSQL :5432     │
                               │  (プライベートサブネット) │
                               └────────────────────────┘

VPC: 10.0.0.0/16
├── パブリックサブネット: 10.0.1.0/24 (ap-northeast-1a)
│     └── EC2 t2.micro（Spring Boot）
└── プライベートサブネット: 10.0.2.0/24 (ap-northeast-1a)
      └── RDS db.t3.micro（PostgreSQL）
```

### 6.2 ネットワーク設計

```
VPC (10.0.0.0/16)
│
├── パブリックサブネット (10.0.1.0/24)
│   ├── インターネットゲートウェイ経由で外部アクセス可能
│   ├── EC2 t2.micro（Spring Boot）
│   └── Security Group: 8080 番ポートのみ開放（CloudFront の IP から）
│
└── プライベートサブネット (10.0.2.0/24)
    ├── インターネットから直接アクセス不可
    ├── RDS db.t3.micro（PostgreSQL）
    └── Security Group: 5432 番ポートは EC2 の Security Group からのみ許可
```

> **プライベートサブネットに RDS を置く理由**：  
> DB は直接インターネットに公開しない。EC2 経由でしかアクセスできないようにする。

### 6.3 データフロー

```
1. ユーザーがブラウザで URL にアクセス
   ↓
2. CloudFront が受信
   ├─ /api/* → EC2（Spring Boot）に転送
   └─ それ以外 → S3 から React の HTML/JS/CSS を返す
   ↓
3. ブラウザが React を実行
   ↓
4. React が CloudFront 経由で API を呼び出す（/api/...）
   ↓
5. EC2（Spring Boot）が RDS に SQL を発行
   ↓
6. 結果を JSON でブラウザに返す
```

### 6.4 セキュリティ設計

| レイヤー | 設定 | 理由 |
|---------|------|------|
| CloudFront | HTTPS 強制 | 通信の暗号化 |
| EC2 Security Group | 8080 を CloudFront IP からのみ許可 | 直接アクセス防止 |
| RDS Security Group | 5432 を EC2 Security Group からのみ許可 | DB の直接公開を防ぐ |
| RDS | パブリックアクセス無効 | プライベートサブネットに配置 |

---

## 7. デプロイ全体フロー

### 7.1 初回デプロイ

```
【事前準備】
1. AWS アカウント作成・IAM ユーザー設定 ← 4 章参照
2. AWS CLI 設定 (aws configure)
3. Terraform インストール
4. Docker インストール（EC2 の SSH 接続用キーペア作成も）

【インフラ構築（Terraform）】
5. terraform/ディレクトリの .tf ファイルを作成
6. terraform init     ← プラグインダウンロード
7. terraform plan     ← 変更プレビュー（何が作られるか確認）
8. terraform apply    ← AWS リソースを作成
   → VPC, サブネット, EC2, RDS, S3, CloudFront が作られる

【アプリのデプロイ】
9.  React をビルド: cd frontend && npm run build
10. ビルド済みファイルを S3 にアップロード
11. EC2 に SSH 接続して Java をインストール
12. Spring Boot の JAR をビルドして EC2 に転送
13. EC2 上で Spring Boot を起動

【動作確認】
14. CloudFront のドメインにアクセスして確認
```

### 7.2 2 回目以降の更新デプロイ

```
【フロントエンド更新】
1. コード修正
2. npm run build
3. aws s3 sync dist/ s3://<バケット名>/ --delete
4. CloudFront キャッシュ削除

【バックエンド更新】
1. コード修正
2. ./gradlew bootJar
3. scp でビルド済み JAR を EC2 に転送
4. EC2 上のプロセスを再起動

【インフラ変更】
1. .tf ファイルを編集
2. terraform plan で変更内容確認
3. terraform apply で反映
```

---

## 8. 実装ステップ詳細

### ステップ 1: SSH キーペアの作成

EC2 に SSH 接続するためのキーペアを作成する。

```bash
# キーペアの作成（~/.ssh/ に保存）
aws ec2 create-key-pair \
  --key-name taskboard-key \
  --query 'KeyMaterial' \
  --output text \
  --profile terraform-deployer \
  --region ap-northeast-1 \
  > ~/.ssh/taskboard-key.pem

# 権限設定（SSH 接続に必要）
chmod 400 ~/.ssh/taskboard-key.pem

# 確認
aws ec2 describe-key-pairs \
  --key-names taskboard-key \
  --profile terraform-deployer \
  --region ap-northeast-1
```

---

### ステップ 2: Terraform ファイルの作成

プロジェクトルートに `terraform/` ディレクトリを作成し、各ファイルを配置する。

#### ファイル作成順序

```
terraform/
├── main.tf           ← 最初に作る（プロバイダー設定）
├── variables.tf      ← 変数定義
├── vpc.tf            ← ネットワーク基盤
├── security_groups.tf← ファイアウォール
├── ec2.tf            ← バックエンドサーバー
├── rds.tf            ← データベース
├── s3.tf             ← 静的ファイル置き場
├── cloudfront.tf     ← CDN
├── outputs.tf        ← 出力値
└── terraform.tfvars  ← 変数の実値（.gitignore に追加）
```

#### .gitignore に追加すべきもの

```bash
# プロジェクトルートの .gitignore に追記
cat >> .gitignore << 'EOF'

# Terraform
terraform/.terraform/
terraform/terraform.tfstate
terraform/terraform.tfstate.backup
terraform/terraform.tfvars
terraform/.terraform.lock.hcl
EOF
```

> `terraform.tfvars` には DB パスワード等の秘密情報が含まれるため Git 管理しない。

---

### ステップ 3: terraform init と plan

```bash
cd terraform/

# 初期化（プラグインのダウンロード）
terraform init

# 変更プレビュー（実際には何もしない）
terraform plan

# 出力例
# + resource "aws_vpc" "main" {     ← + は新規作成
# ~ resource "aws_instance" "web" { ← ~ は変更
# - resource "aws_s3_bucket" "old" {← - は削除
```

---

### ステップ 4: terraform apply でリソース作成

```bash
terraform apply

# 確認プロンプトが表示される
# Enter a value: yes と入力

# 完了後、outputs に URL が表示される
# cloudfront_url = "https://xxxx.cloudfront.net"
# ec2_public_ip  = "54.xxx.xxx.xxx"
```

---

### ステップ 5: バックエンドのデプロイ

```bash
# Spring Boot JAR をビルド
cd ../backend
./gradlew bootJar -Dorg.gradle.java.home=$JAVA_HOME

# EC2 に JAR を転送
scp -i ~/.ssh/taskboard-key.pem \
  build/libs/taskboard-0.0.1-SNAPSHOT.jar \
  ec2-user@<EC2_PUBLIC_IP>:/home/ec2-user/

# EC2 に SSH 接続
ssh -i ~/.ssh/taskboard-key.pem ec2-user@<EC2_PUBLIC_IP>

# EC2 上で実行
java -jar taskboard-0.0.1-SNAPSHOT.jar \
  --spring.profiles.active=postgres \
  --spring.datasource.url=jdbc:postgresql://<RDS_ENDPOINT>:5432/taskboard \
  --spring.datasource.username=taskboard \
  --spring.datasource.password=<DB_PASSWORD> \
  &
```

---

### ステップ 6: フロントエンドのデプロイ

```bash
# React をビルド
cd ../frontend
npm run build

# S3 にアップロード
aws s3 sync dist/ s3://taskboard-frontend-<ACCOUNT_ID>/ \
  --delete \
  --profile terraform-deployer

# CloudFront キャッシュを削除
aws cloudfront create-invalidation \
  --distribution-id <DISTRIBUTION_ID> \
  --paths "/*" \
  --profile terraform-deployer
```

---

### ステップ 7: 動作確認

```bash
# CloudFront URL にアクセス
# terraform output で URL を確認
cd terraform/
terraform output cloudfront_url

# ヘルスチェック
curl https://<CLOUDFRONT_DOMAIN>/api/columns
```

---

## 9. トラブルシューティング

### よくあるエラーと対処法

#### `Error: No valid credential sources found`

```bash
# 原因: AWS 認証情報が設定されていない
# 対処:
aws configure --profile terraform-deployer
export AWS_PROFILE=terraform-deployer
```

#### `Error: InvalidClientTokenId`

```bash
# 原因: アクセスキーが無効
# 対処: IAM コンソールでキーの状態を確認
aws iam list-access-keys --user-name terraform-deployer
```

#### `Error: UnauthorizedOperation`

```bash
# 原因: IAM ユーザーに必要な権限がない
# 対処: AdministratorAccess が付与されているか確認
aws iam list-attached-user-policies --user-name terraform-deployer
```

#### `terraform plan` で変更なしなのに `apply` が失敗する

```bash
# 原因: tfstate が実際の AWS 状態と乖離している
# 対処: state を更新
terraform refresh
```

#### EC2 への SSH 接続が拒否される

```bash
# 原因: キーの権限が正しくない
chmod 400 ~/.ssh/taskboard-key.pem

# Security Group が 22 番ポートを許可していないか確認
aws ec2 describe-security-groups --group-ids <SG_ID>
```

---

## 10. 参考リンク

| リソース | URL |
|---------|-----|
| AWS 無料枠の詳細 | https://aws.amazon.com/jp/free/ |
| Terraform AWS Provider ドキュメント | https://registry.terraform.io/providers/hashicorp/aws/latest/docs |
| Terraform 公式チュートリアル（日本語） | https://developer.hashicorp.com/terraform/tutorials |
| AWS CLI コマンドリファレンス | https://docs.aws.amazon.com/cli/latest/ |
| AWS Well-Architected（基礎知識） | https://aws.amazon.com/jp/architecture/well-architected/ |

---

## 付録: 削除手順（課金を止める）

```bash
# すべての AWS リソースを削除（課金停止）
cd terraform/
terraform destroy

# 確認プロンプトに yes と入力
# 注意: RDS のデータは削除される
```

> **重要**：使い終わったら必ず `terraform destroy` を実行すること。  
> EC2・RDS を起動したまま放置すると、無料枠終了後に課金が発生する。
