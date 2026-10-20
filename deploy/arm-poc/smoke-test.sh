#!/bin/sh
# Checks a running proof of concept. Run on the A1 host from deploy/arm-poc.
set -u

echo "==> Host: $(uname -m)"
echo "==> Containers"
docker compose ps

echo "==> Container architecture and Node"
docker compose exec -T dicecloud node -e "console.log(process.arch, process.version)"

echo "==> Mongo replica set"
docker compose exec -T mongo mongosh --quiet --eval "rs.status().members.map(m => m.name + ' ' + m.stateStr).join('\n')"

echo "==> Waiting for /api/status"
i=0
until code="$(curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:3000/api/status)" && [ "$code" = 200 ]; do
  i=$((i + 1))
  if [ "$i" -ge 30 ]; then
    echo "FAIL /api/status returned ${code:-nothing} after 150s. Last app logs:"
    docker compose logs --tail 50 dicecloud
    exit 1
  fi
  sleep 5
done
echo "OK   /api/status returned 200"

echo "==> Home page"
curl -s http://127.0.0.1:3000/ | grep -qi "<html" && echo "OK   page served" || { echo "FAIL page not served"; exit 1; }

echo "==> Memory use"
docker stats --no-stream --format "{{.Name}}: {{.MemUsage}} ({{.CPUPerc}} CPU)"

echo "Automated checks passed. Now do the manual 2d10 check in README.md."
