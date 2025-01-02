import { Component, Input } from "@angular/core";
import { Article } from "../models/article.model";
import { ArticleMetaComponent } from "./article-meta.component";
import { RouterLink } from "@angular/router";
import { NgForOf, NgIf } from "@angular/common";
import { FavoriteButtonComponent } from "./favorite-button.component";

@Component({
  selector: "app-article-preview",
  template: `
    <div class="article-preview">
      <app-article-meta [article]="article">
        <app-favorite-button
          [article]="article"
          (toggle)="toggleFavorite($event)"
          class="pull-xs-right"
        >
        </app-favorite-button>
      </app-article-meta>

      <a [routerLink]="['/article', article.slug]" class="preview-link">
        <div class="article-header">
          <img
            *ngIf="article.image"
            [src]="article.image"
            alt="{{ article.title }}"
            class="article-image"
          />
          <h1>{{ article.title }}</h1>
        </div>
        <p>{{ article.description }}</p>
        <span>Read more...</span>
        <ul class="tag-list">
          <li
            *ngFor="let tag of article.tagList"
            class="tag-default tag-pill tag-outline"
          >
            {{ tag }}
          </li>
        </ul>
      </a>
    </div>
  `,
  imports: [
    ArticleMetaComponent,
    FavoriteButtonComponent,
    RouterLink,
    NgForOf,
    NgIf,
  ],
  standalone: true,
})
export class ArticlePreviewComponent {
  @Input() article!: Article;

  toggleFavorite(favorited: boolean): void {
    this.article.favorited = favorited;

    if (favorited) {
      this.article.favoritesCount++;
    } else {
      this.article.favoritesCount--;
    }
  }
}
