# github2todoist
A simple Cloufdflare Worker endpoint that creates newly assigned Github issues in Todoist


## How to use on Github

![image](https://github.com/user-attachments/assets/70b9ad46-689c-47ba-bbf1-3b84cc3a36b2)


## Development
### Clouflare

This project was initialised with these commands:

```shell
npm install -g wrangler
wrangler login
wrangler init --from-dash github2todoist
wrangler secret put TODOIST_API_KEY
wrangler secret put GITHUB_WEBHOOK_SECRET
```

Deploy with
```shell
wrangler deploy
```

### Local Development setup

Clone the repository, then run:
```shell
npm install
```

To update `wrangler`:
```shell
npm install wrangler
```

### Deployment

There is a github action that will deploy the latest version to Cloudflare
