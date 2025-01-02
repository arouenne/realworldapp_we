import { Component, DestroyRef, inject, OnInit } from "@angular/core";
import { FormControl, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { Article } from "../../models/article.model";
import { ArticlesService } from "../../services/articles.service";
import { CommentsService } from "../../services/comments.service";
import { ArticleMetaComponent } from "../../components/article-meta.component";
import { AsyncPipe, NgClass, NgForOf, NgIf } from "@angular/common";
import { MarkdownPipe } from "../../../../shared/pipes/markdown.pipe";
import { ListErrorsComponent } from "../../../../shared/components/list-errors.component";
import { ArticleCommentComponent } from "../../components/article-comment.component";

import { catchError } from "rxjs/operators";
import { combineLatest, throwError } from "rxjs";
import { Comment } from "../../models/comment.model";
import { Errors } from "../../../../core/models/errors.model";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { FavoriteButtonComponent } from "../../components/favorite-button.component";

@Component({
  selector: "app-article-page",
  templateUrl: "./article.component.html",
  imports: [
    ArticleMetaComponent,
    RouterLink,
    NgClass,
    FavoriteButtonComponent,
    NgForOf,
    MarkdownPipe,
    AsyncPipe,
    ListErrorsComponent,
    FormsModule,
    ArticleCommentComponent,
    ReactiveFormsModule,
    NgIf,
  ],
  standalone: true,
})
export default class ArticleComponent implements OnInit {
  article!: Article;
  comments: Comment[] = [];
  canModify: boolean = false;

  commentControl = new FormControl<string>("", { nonNullable: true });
  commentFormErrors: Errors | null = null;

  isSubmitting = false;
  isDeleting = false;
  destroyRef = inject(DestroyRef);

  constructor(
    private readonly route: ActivatedRoute,
    private readonly articleService: ArticlesService,
    private readonly commentsService: CommentsService,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    const slug = this.route.snapshot.params["slug"];
    combineLatest([
      this.articleService.get(slug),
      this.commentsService.getAll(slug),
    ])
      .pipe(
        catchError((err) => {
          void this.router.navigate(["/"]);
          return throwError(() => err);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(([article, comments]) => {
        this.article = article;
        this.comments = comments;
        this.canModify = true;
      });
  }

  onToggleFavorite(favorited: boolean): void {
    this.article.favorited = favorited;

    if (favorited) {
      this.article.favoritesCount++;
    } else {
      this.article.favoritesCount--;
    }
  }

  deleteArticle(): void {
    this.isDeleting = true;

    this.articleService
      .delete(this.article.slug)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        void this.router.navigate(["/"]);
      });
  }

  addComment() {
    this.isSubmitting = true;
    this.commentFormErrors = null;

    this.commentsService
      .add(this.article.slug, this.commentControl.value)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (comment) => {
          console.log("Comment added:", comment); // Debug the response
          this.comments.unshift(comment); // Add the new comment to the list
          this.commentControl.reset(""); // Reset the form control
          this.isSubmitting = false; // End submitting state
        },
        error: (errors) => {
          this.isSubmitting = false; // End submitting state on error
          this.commentFormErrors = errors; // Handle errors
        },
      });
  }

  deleteComment(comment: Comment): void {
    this.commentsService
      .delete(comment.id, this.article.slug)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.comments = this.comments.filter((item) => item !== comment);
      });
  }
}
