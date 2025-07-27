const verify_signature = async (req: Request, webhookSecret: string) => {
  const encoder = new TextEncoder();
  const reqBody = await req.clone().text();
  const key = await crypto.subtle.importKey(
      "raw", 
      encoder.encode(webhookSecret),
      {name: "HMAC", hash: {name: "SHA-256"}},
      false,
      ["sign"]
  );

  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(reqBody));
  const hexSignature = Array.prototype.map.call(new Uint8Array(signature), x => ('00' + x.toString(16)).slice(-2)).join('');
  
  return `sha256=${hexSignature}` === req.headers.get("x-hub-signature-256");
};

export default {
  async fetch(request: Request, env: any, ctx: any) {
    if (!verify_signature(request, env.GITHUB_WEBHOOK_SECRET)) {
      return new Response('Unauthorized', {status: 401});
    }

    const payload: any = await request.json();  // The payload is sent as JSON

    if (payload.action !== "assigned") {
      return new Response('Payload processed successfully', {status: 200});
    }

    const todoistTask: {
      content: string;
      description: string;
      priority: number;
      due_date?: string;
    } = {
      content: `#${payload.issue.number}: ${payload.issue.title}`, // eg. "#69: Fix this issue"
      description:
        `*Issue URL*: ${payload.issue.html_url}
      *Repository*: ${payload.issue.repository_url}
      *Sender*: ${payload.sender.login}
      `,
      priority: 4,
      // project_id: x
    };

    if (payload.due_date) {
      todoistTask.due_date = payload.due_date;
    }

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

    return new Response('Todoist task created successfully', {status: 201});
  },
};
