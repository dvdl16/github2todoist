import * as crypto from "crypto";

const verify_signature = (req: Request, webhookSecret: string) => {
  const signature = crypto
    .createHmac("sha256", webhookSecret)
    .update(JSON.stringify(req.body))
    .digest("hex");
  return `sha256=${signature}` === req.headers.get("x-hub-signature-256");
};

export default {
  async fetch(request: Request, env: any, ctx: any) {
    if (!verify_signature(request, env.GITHUB_WEBHOOK_SECRET)) {
      return new Response('Unauthorized', {status: 401});
    }

    const payload: any = await request.json();  // The payload is sent as JSON

    const todoistTask = {
      content: `**#${payload.issue.number}**: ${payload.issue.title}`,
      description: 
      `*Issue URL*: ${payload.issue.html_url}
      *Repository*: ${payload.issue.repository_url}
      *Sender*: ${payload.sender.login}
      `,
      priority: 4,
      // project_id: x
    };

    const init = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${env.TODOIST_API_KEY}`,
      },
      body: JSON.stringify(todoistTask),
    };

    const todoistResponse = await fetch('https://api.todoist.com/rest/v2/tasks', init);

    if (!todoistResponse.ok) {
      return todoistResponse
    }

    return new Response('Todoist task created successfully');
  },
};
