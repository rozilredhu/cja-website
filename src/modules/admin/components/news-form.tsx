"use client";

import { useActionState } from "react";
import { saveNewsArticleAction } from "@/modules/admin/actions";
import type { AdminFormState, NewsArticleRow } from "@/modules/admin/types";

const initial: AdminFormState = {};

type Props = { article?: NewsArticleRow | null };

export function NewsForm({ article }: Props) {
  const [state, action, pending] = useActionState(saveNewsArticleAction, initial);

  return (
    <form action={action} className="stack-form">
      {article ? <input type="hidden" name="id" value={article.id} /> : null}
      {state.error ? <p className="form-error">{state.error}</p> : null}
      {state.success ? <p className="form-success">{state.success}</p> : null}

      <label>
        Title *
        <input name="title" required defaultValue={article?.title ?? ""} />
      </label>
      <label>
        Slug *
        <input
          name="slug"
          required={!article}
          placeholder="auto from title if blank on create"
          defaultValue={article?.slug ?? ""}
        />
      </label>
      <label>
        Meta description
        <textarea
          name="meta_description"
          rows={2}
          defaultValue={article?.meta_description ?? ""}
        />
      </label>
      <label>
        Body (paragraphs separated by blank lines)
        <textarea name="body" rows={10} defaultValue={article?.body ?? ""} />
      </label>
      <label>
        Author
        <input name="author" defaultValue={article?.author ?? ""} />
      </label>
      <label>
        Published at (YYYY-MM-DD)
        <input
          name="published_at"
          type="date"
          defaultValue={article?.published_at?.slice(0, 10) ?? ""}
        />
      </label>
      <label className="checkbox-row">
        <input
          type="checkbox"
          name="published"
          value="1"
          defaultChecked={Boolean(article?.published)}
        />{" "}
        Published
      </label>
      <label className="checkbox-row">
        <input
          type="checkbox"
          name="featured"
          value="1"
          defaultChecked={Boolean(article?.featured)}
        />{" "}
        Featured
      </label>

      <button type="submit" className="btn-primary" disabled={pending}>
        {pending ? "Saving…" : article ? "Update article" : "Create article"}
      </button>
    </form>
  );
}
