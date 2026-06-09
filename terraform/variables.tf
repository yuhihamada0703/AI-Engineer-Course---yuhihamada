variable "aws_region" {
  type    = string
  default = "ap-northeast-1"
}

variable "aws_profile" {
  type    = string
  default = "yuhihamada73"
}

variable "project_name" {
  type    = string
  default = "taskboard"
}

variable "key_name" {
  type        = string
  description = "EC2 SSH キーペア名（aws ec2 create-key-pair で作成したもの）"
}

variable "db_name" {
  type    = string
  default = "taskboard"
}

variable "db_username" {
  type    = string
  default = "taskboard"
}

variable "db_password" {
  type        = string
  sensitive   = true
  description = "RDS PostgreSQL のパスワード（terraform.tfvars に記載、gitignore 済み）"
}
