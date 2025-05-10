/** @format */

// app/api/image-info/route.ts
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const file = searchParams.get("file");

  if (!file) {
    return new Response(JSON.stringify({ error: "Missing 'file' parameter" }), {
      status: 400,
    });
  }

  const apiUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=File:${encodeURIComponent(
    file
  )}&prop=imageinfo&iiprop=url&format=json&origin=*`;

  try {
    const res = await fetch(apiUrl);
    if (!res.ok) {
      throw new Error(`Wikipedia API error: ${res.statusText}`);
    }

    const data = await res.json();
    const pages = data?.query?.pages;
    const page = pages[Object.keys(pages)[0]];
    const imageUrl = page?.imageinfo?.[0]?.url;
    // console.log(data)
    if (!imageUrl) {
      return new Response(JSON.stringify({ error: "Image not found" }), {
        status: 404,
      });
    }

    return new Response(JSON.stringify({ imageUrl }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching image info:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch image info" }),
      { status: 500 }
    );
  }
}
