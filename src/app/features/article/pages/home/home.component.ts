import { Component, DestroyRef, inject, OnInit } from "@angular/core";
import { Router } from "@angular/router";

import { TagsService } from "../../services/tags.service";
import { ArticleListConfig } from "../../models/article-list-config.model";
import { AsyncPipe, NgClass, NgForOf } from "@angular/common";
import { ArticleListComponent } from "../../components/article-list.component";
import { tap } from "rxjs/operators";
import { RxLet } from "@rx-angular/template/let";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

@Component({
  selector: "app-home-page",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.css"],
  imports: [NgClass, ArticleListComponent, AsyncPipe, RxLet, NgForOf],
  standalone: true,
})
export default class HomeComponent implements OnInit {
  isAuthenticated = true;
  listConfig: ArticleListConfig = {
    type: "all",
    filters: {},
  };
  tags$ = inject(TagsService)
    .getAll()
    .pipe(tap(() => (this.tagsLoaded = true)));
  tagsLoaded = false;
  destroyRef = inject(DestroyRef);

  constructor(private readonly router: Router) {}

  ngOnInit(): void {
    this.setListTo("all");
  }

  setListTo(type: string = "", filters: Object = {}): void {
    // If feed is requested but user is not authenticated, redirect to login

    // Otherwise, set the list object
    this.listConfig = { type: type, filters: filters };
  }
}
