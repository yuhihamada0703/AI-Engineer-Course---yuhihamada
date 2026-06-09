data "aws_ami" "amazon_linux_2023" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["al2023-ami-*-x86_64"]
  }
}

resource "aws_instance" "app" {
  ami                    = data.aws_ami.amazon_linux_2023.id
  instance_type          = "t3.micro"
  subnet_id              = aws_subnet.public.id
  vpc_security_group_ids = [aws_security_group.ec2.id]
  key_name               = var.key_name

  root_block_device {
    volume_size = 8
    volume_type = "gp3"
  }

  user_data = <<-EOF
    #!/bin/bash
    dnf update -y
    dnf install -y git nginx

    # ルートパーティションをボリューム全体に拡張
    growpart /dev/nvme0n1 1
    xfs_growfs /

    # Nginx を自動起動に設定
    systemctl enable nginx
    systemctl start nginx
  EOF

  tags = {
    Name = "${var.project_name}-app-server"
  }
}
