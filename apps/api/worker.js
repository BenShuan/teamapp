export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url)

    // Try to serve static assets first
    let response = await env.ASSETS.fetch(request)

    // If asset not found (404), serve index.html instead
    if (response.status === 404) {
      return await env.ASSETS.fetch(new Request("/index.html", request))
    }

    return response
  }
}
