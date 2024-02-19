nohup /app/collector --config /etc/collector/agent.yaml 1> /var/log/collector.log 2>&1 &
/app/hotrod $1
