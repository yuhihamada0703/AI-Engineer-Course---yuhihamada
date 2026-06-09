# AWS インフラ構成

タスクボードの本番環境を構成する AWS インフラの概要。  
Terraform コードは `terraform/` ディレクトリを参照。

---

## アーキテクチャ概要

```
インターネット
     │
     ▼ HTTP :80
┌─────────────────────────────────────────┐
│  EC2 (Amazon Linux 2023, ap-northeast-1) │
│                                         │
│  ┌──────────────────────────────────┐   │
│  │ Nginx（リバースプロキシ）         │   │
│  │  /        → React 静的ファイル   │   │
│  │  /api/*   → localhost:8080      │   │
│  └──────────────┬───────────────────┘   │
│                 │ :8080                 │
│  ┌──────────────▼───────────────────┐   │
│  │ Spring Boot（taskboard.service）  │   │
│  │  JVM -Xmx512m                    │   │
│  │  systemd で自動起動               │   │
│  └──────────────┬───────────────────┘   │
└─────────────────┼───────────────────────┘
                  │ PostgreSQL :5432（VPC 内部のみ）
     ┌────────────▼────────────┐
     │  RDS（プライベートサブネット）│
     │  PostgreSQL 16           │
     └─────────────────────────┘
```

---

## AWS サービス構成

| サービス | スペック | 役割 |
|---------|---------|------|
| VPC | CIDR: 10.0.0.0/16 | 全リソースの仮想ネットワーク |
| パブリックサブネット | 10.0.1.0/24 (ap-northeast-1a) | EC2 を配置。インターネット接続あり |
| プライベートサブネット A | 10.0.10.0/24 (ap-northeast-1a) | RDS 用。インターネット接続なし |
| プライベートサブネット C | 10.0.11.0/24 (ap-northeast-1c) | RDS 冗長化要件（別 AZ） |
| EC2 | t3.micro, Amazon Linux 2023 | アプリサーバー（Nginx + Spring Boot） |
| RDS | db.t3.micro, PostgreSQL 16 | マネージド PostgreSQL |
| Internet Gateway | — | VPC からインターネットへの出口 |
| Security Group (EC2) | Port 80: 全世界, Port 22/8080: 開発者 IP のみ | EC2 へのアクセス制御 |
| Security Group (RDS) | Port 5432: EC2 SG のみ | RDS は EC2 からのみ接続可能 |

---

## ネットワーク設計

```
VPC (10.0.0.0/16)
├── パブリックサブネット (10.0.1.0/24)  ←→ Internet Gateway
│   └── EC2 app-server
└── プライベートサブネット
    ├── 10.0.10.0/24 (ap-northeast-1a)
    └── 10.0.11.0/24 (ap-northeast-1c)
        └── RDS taskboard-db
```

RDS はインターネットから直接到達できないプライベートサブネットに配置。  
EC2 からのみ接続可能（Security Group でソース SG を指定）。

---

## EC2 内部構成

### ディレクトリ構成

```
/opt/taskboard/
├── taskboard-0.0.1-SNAPSHOT.jar   # Spring Boot fat JAR
└── env                             # 環境変数ファイル（chmod 600）

/usr/share/nginx/html/              # React ビルド成果物（dist/）
├── index.html
└── assets/

/etc/nginx/conf.d/
└── taskboard.conf                  # Nginx 設定

/etc/systemd/system/
└── taskboard.service               # Spring Boot の systemd ユニット
```

### Nginx 設定概要

| パス | 処理 |
|------|------|
| `/api/*` | `localhost:8080` へプロキシ |
| `/*` | React の `index.html` を返す（SPA フォールバック） |

### systemd サービス

- サービス名: `taskboard`
- 自動起動: `systemctl enable taskboard`（OS 再起動後も自動起動）
- 障害時再起動: `Restart=on-failure, RestartSec=10`
- JVM ヒープ上限: `-Xmx512m`（t3.micro の 1GB RAM に合わせた制限）

---

## デプロイフロー

```
[ローカル Mac]
  1. ./gradlew clean build -x test  → backend/build/libs/*.jar
  2. npm run build                  → frontend/dist/

[EC2 への転送]
  3. SCP で JAR を /opt/taskboard/ へ
  4. SCP で dist/ を /usr/share/nginx/html/ へ

[EC2 上での起動]
  5. systemctl start taskboard
  6. Flyway が起動時に DB マイグレーションを自動適用
```

---

## インフラ管理

インフラは Terraform で管理。`terraform/` ディレクトリのコードが構成の唯一の正解。

| ファイル | 管理対象 |
|---------|---------|
| `terraform/vpc.tf` | VPC・サブネット・Internet Gateway |
| `terraform/security_groups.tf` | EC2 SG・RDS SG |
| `terraform/ec2.tf` | EC2 インスタンス・AMI |
| `terraform/rds.tf` | RDS インスタンス・DB サブネットグループ |
| `terraform/variables.tf` | 変数定義 |
| `terraform/outputs.tf` | 出力値（IP・エンドポイント等） |

`terraform.tfvars`（キーペア名・DB パスワード等）は `.gitignore` で除外。  
`terraform.tfvars.example` を参考に各自作成すること。
