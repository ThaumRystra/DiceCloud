# ARM proof of concept (Oracle A1)

This kit tests whether the fork's Meteor 2.16 server runs on Oracle's Ampere A1 (arm64). Meteor 2.x has no Linux ARM tooling, so the work is split in two:

1. **Build the bundle on x86_64.** Use your PC (`Dockerfile.bundle`) or GitHub Actions (`.github/workflows/build-bundle.yml`). The output is `dist/app.tar.gz`.
2. **Run the bundle on the A1.** `Dockerfile.arm64` puts Node 14.21.3 for arm64 on Debian 12 and recompiles the native modules (fibers, bcrypt, sharp) on the host. `verify-native.js` then checks that they load, and **the image build fails if they don't.** That failure is the go/no-go signal.

The test has passed when the image builds, `smoke-test.sh` reports OK, and a 2d10 roll works in the browser.

## Stay inside Always Free (PAYG account)

Since 15 June 2026 the free A1 allowance is **1,500 OCPU-hours and 9,000 GB-hours a month, which equals 2 OCPU / 12 GB running all month**. It used to be 4 / 24. Oracle Support has given PAYG accounts conflicting answers about whether they get the old limit, so treat 2 / 12 as the cap. Anything above it may be billed.

| Setting | Use |
|---|---|
| Shape | `VM.Standard.A1.Flex`, **one** instance, **2 OCPU, 12 GB**. Or start at 1 OCPU / 6 GB; the test fits easily. |
| Image | Canonical Ubuntu 24.04 (aarch64) |
| Boot volume | Default (~47–50 GB). Free total is 200 GB of boot + block volumes. |
| Region | Your **home region** only. Free resources elsewhere are billed. |
| Networking | One VCN with a public subnet. **No load balancer, no extra reserved IPs** for this test. |
| Backups | At most 5 volume backups in total. |
| Other A1 or E2 instances | Count them. A1 usage is pooled across every instance in the tenancy. |

Set up these guard rails before creating the instance:

1. **Budget alert:** Billing & Cost Management → Budgets. Create a $1 budget with an alert at 1% of actual spend. Alerts are delayed, so check this weekly.
2. **Hard cap with quotas:** Identity & Security → Quotas → create a policy on the root compartment:
   ```
   set compute-core quota standard-a1-core-count to 2 in tenancy
   set compute-memory quota standard-a1-memory-count to 12 in tenancy
   set block-storage quota total-storage-gb to 200 in tenancy
   ```
   If the console rejects a quota name, look it up under Limits, Quotas and Usage (service Compute, "Standard.A1"). These statements were not tested against your tenancy. Once they're in place, OCI refuses to create anything that would exceed the free limits.
3. Afterwards, check Billing → Cost Analysis. It should stay at $0.00.

## 1. Build the bundle (x86)

**Option A: GitHub Actions (no Docker on your PC).**
1. Push this branch.
2. Go to Actions → "Build server bundle" → Run workflow. The run can take 20–45 minutes.
3. Download the `app-bundle` artifact and unzip it to get `app.tar.gz`.
4. Put the file in `deploy/arm-poc/dist/`.

**Option B: Docker Desktop on your PC.** Start Docker Desktop, then from the repo root run:

```bash
docker build --platform linux/amd64 -f deploy/arm-poc/Dockerfile.bundle --target export --output type=local,dest=deploy/arm-poc/dist .
```

Give Docker at least 6 GB of RAM: Settings → Resources (or `.wslconfig` under WSL2).

## 2. Prepare the A1 instance

SSH in as `ubuntu`, then:

```bash
sudo apt-get update && sudo apt-get install -y docker.io docker-compose-v2
```

```bash
sudo usermod -aG docker ubuntu && exit
```

Log back in so the group change takes effect. No firewall or Security List changes are needed for this test.

## 3. Copy the kit and start it

From the repo root on your PC:

```bash
scp -r deploy/arm-poc ubuntu@YOUR_A1_IP:~/
```

On the A1:

```bash
cd ~/arm-poc && cp .env.example .env && docker compose up -d --build
```

The first build compiles fibers and bcrypt, which takes a few minutes. Watch the `verify-native.js` step:

- `OK fibers` and `OK bcrypt` mean the native rebuild worked.
- `WARN` lines about leftover x86 `.node` files or sharp are not fatal.
- `FAIL` stops the build. The output shows which module failed and why. Keep it; this is the evidence for the go/no-go decision.

Then run:

```bash
sh smoke-test.sh
```

## 4. Manual 2d10 check

Open an SSH tunnel from your PC:

```bash
ssh -L 3000:127.0.0.1:3000 ubuntu@YOUR_A1_IP
```

1. Browse to http://localhost:3000 and register an account. Because emails go to the logs for now, `docker compose logs dicecloud` shows any verification link.
2. Create a character. Add an ability and a skill or check, and roll it.
3. Confirm the log shows a **2d10** roll with the RA ability modifier, not a d20.
4. Use the advantage stepper once to confirm it changes the dice.

## Results

| Result | Meaning | Next step |
|---|---|---|
| All checks pass | The ARM path works on Meteor 2.16 | Go on to Phase 0/1 of the report: real Mongo auth, persistent uploads, Caddy + HTTPS, backups |
| Image build fails at `verify-native.js` | A native module will not run on arm64 Node 14 | Report the failing module. The options are a fix for that module, x86 hosting elsewhere, or moving the Meteor 3 migration earlier. |
| Build passes but the app crashes | The problem is at runtime, not in the native modules | `docker compose logs dicecloud` |

To tear down (this also deletes the test database):

```bash
docker compose down -v
```

## Known limits of this test

- **Node version:** it uses upstream Node 14.21.3. Meteor's own patched 14.21.4 is not published for arm64. Both are end-of-life.
- **MongoDB:** it has no authentication. The port is never published, but add auth with a keyFile before players join.
- **Uploads:** uploaded images and archived characters are stored inside the container and are lost on a rebuild. Don't archive characters you want to keep during the test.
- **Network exposure:** it listens on 127.0.0.1 only. Public access (Caddy, ports 80/443, iptables) is a later step.
