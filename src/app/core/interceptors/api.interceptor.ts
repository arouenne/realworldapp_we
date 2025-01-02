import { HttpInterceptorFn } from "@angular/common/http";
import { of } from "rxjs";
import { HttpResponse } from "@angular/common/http";

const mockArticles = [
  {
    id: 1,
    title: "First Article",
    description: "This is a mock article.",
    body: "Content of the mock article.",
    tagList: ["mock", "test"],
    slug: "first-article",
    image: "",
  },
];

const mockComments: Record<
  string,
  Array<{ id: number; body: string; createdAt: string }>
> = {
  "first-mock-article": [
    { id: 1, body: "This is a comment", createdAt: new Date().toISOString() },
  ],
};

export const apiMockInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.url.includes("/comments") && req.method === "POST") {
    const slug = req.url.split("/")[2];
    const body = req.body as { comment: { body: string } };

    if (!body.comment.body) {
      return of(
        new HttpResponse({
          body: { error: "Comment body is required" },
          status: 400,
          statusText: "Bad Request",
        }),
      );
    }

    const newComment = {
      id: (mockComments[slug]?.length || 0) + 1,
      body: body.comment.body,
      createdAt: new Date().toISOString(),
      author: "mock-user",
    };

    mockComments[slug] = [...(mockComments[slug] || []), newComment];

    return of(
      new HttpResponse({
        body: { comment: newComment },
        status: 201,
        statusText: "Created",
      }),
    );
  }

  if (req.url.includes("/comments") && req.method === "DELETE") {
    const [slug, commentId] = req.url.split("/").slice(2, 4);
    const commentsForArticle = mockComments[slug] || [];

    const index = commentsForArticle.findIndex(
      (comment) => comment.id === parseInt(commentId, 10),
    );

    if (index !== -1) {
      commentsForArticle.splice(index, 1);
      mockComments[slug] = commentsForArticle;

      return of(
        new HttpResponse({
          status: 204,
          statusText: "No Content",
        }),
      );
    } else {
      return of(
        new HttpResponse({
          body: { error: "Comment not found" },
          status: 404,
          statusText: "Not Found",
        }),
      );
    }
  }

  if (req.url.includes("/articles") && req.method === "GET") {
    if (req.url.includes("/comments")) {
      const slug = req.url.split("/")[2];
      return of(
        new HttpResponse({
          body: { comments: mockComments[slug] || [] },
          status: 200,
          statusText: "OK",
        }),
      );
    } else {
      return of(
        new HttpResponse({
          body: { articles: mockArticles, articlesCount: mockArticles.length },
          status: 200,
          statusText: "OK",
        }),
      );
    }
  }

  if (req.url.includes("/articles") && req.method === "POST") {
    const body = req.body as { article: Partial<(typeof mockArticles)[0]> };
    const newArticle = body.article;

    if (!newArticle || !newArticle.title) {
      return of(
        new HttpResponse({
          body: { error: "Title is required to create an article" },
          status: 400,
          statusText: "Bad Request",
        }),
      );
    }

    const fullArticle = {
      id: mockArticles.length + 1,
      title: newArticle.title,
      description: newArticle.description || "",
      body: newArticle.body || "",
      tagList: newArticle.tagList || [],
      slug: newArticle.title.toLowerCase().replace(/\s+/g, "-"),
      image: newArticle.image || "",
    };

    console.log(fullArticle);

    mockArticles.push(fullArticle);
    mockComments[fullArticle.slug] = [];

    return of(
      new HttpResponse({
        body: { article: fullArticle },
        status: 201,
        statusText: "Created",
      }),
    );
  }

  if (req.url.includes("/articles") && req.method === "DELETE") {
    const slug = req.url.split("/").pop();
    const index = mockArticles.findIndex((article) => article.slug === slug);

    if (index !== -1) {
      mockArticles.splice(index, 1);
      delete mockComments[slug!];
      return of(
        new HttpResponse({
          status: 204,
          statusText: "No Content",
        }),
      );
    } else {
      return of(
        new HttpResponse({
          body: { error: "Article not found" },
          status: 404,
          statusText: "Not Found",
        }),
      );
    }
  }

  return next(req);
};
