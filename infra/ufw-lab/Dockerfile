FROM ubuntu:24.04

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    ufw iproute2 iptables iputils-ping curl net-tools procps sudo \
  && rm -rf /var/lib/apt/lists/*

CMD ["bash", "-lc", "ufw --force reset && ufw default deny incoming && ufw default allow outgoing && ufw --force enable && tail -f /dev/null"]
