import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
import { Article } from "../models/article.model";
import { RouterLink } from "@angular/router";
import { DatePipe } from "@angular/common";

@Component({
  selector: "app-article-meta",
  template: `
    <div class="article-meta">
      <div class="info">
        <span class="date">
          {{ article.createdAt | date: "longDate" }}
        </span>
      </div>

      <ng-content></ng-content>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, DatePipe],
  standalone: true,
})
export class ArticleMetaComponent {
  @Input() article!: Article;
}
