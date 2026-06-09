output "ec2_public_ip" {
  value       = aws_instance.app.public_ip
  description = "EC2 パブリック IP アドレス"
}

output "ssh_command" {
  value       = "ssh -i ~/.ssh/taskboard-key.pem ec2-user@${aws_instance.app.public_ip}"
  description = "SSH 接続コマンド"
}

output "app_url" {
  value       = "http://${aws_instance.app.public_ip}:8080"
  description = "Spring Boot アクセス URL（アプリデプロイ後に使用）"
}

output "rds_endpoint" {
  value       = aws_db_instance.postgres.endpoint
  description = "RDS PostgreSQL エンドポイント（EC2 から接続する際に使用）"
}

output "rds_connection_string" {
  value       = "postgresql://${var.db_username}@${aws_db_instance.postgres.endpoint}/${var.db_name}"
  description = "psql 接続文字列（パスワードは別途入力）"
}
