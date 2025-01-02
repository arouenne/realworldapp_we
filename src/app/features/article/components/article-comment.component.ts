import { Component, EventEmitter, Input, Output, inject } from "@angular/core";
import { RouterLink } from "@angular/router";
import { map } from "rxjs/operators";
import { Comment } from "../models/comment.model";
import { AsyncPipe, DatePipe, NgIf } from "@angular/common";

@Component({
  selector: "app-article-comment",
  template: `
    @if (comment) {
      <div class="card">
        <div class="card-block">
          <p class="card-text">
            {{ comment.body }}
          </p>
        </div>
        <div class="card-footer">
          &nbsp;
          <span class="date-posted">
            {{ comment.createdAt | date: "longDate" }}
          </span>

          <span class="mod-options">
            <i class="ion-trash-a" (click)="delete.emit(true)"></i>
          </span>
        </div>
      </div>
    }
  `,
  imports: [RouterLink, DatePipe, NgIf, AsyncPipe],
  standalone: true,
})
export class ArticleCommentComponent {
  @Input() comment!: Comment;
  @Output() delete = new EventEmitter<boolean>();

  canModify$ = true;
}
