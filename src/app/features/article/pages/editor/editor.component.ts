import { NgIf, NgForOf } from "@angular/common";
import { Component, DestroyRef, inject, OnInit } from "@angular/core";
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  UntypedFormGroup,
} from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { catchError, combineLatest, of, switchMap, throwError } from "rxjs";
import { Errors } from "../../../../core/models/errors.model";
import { ArticlesService } from "../../services/articles.service";
import { ListErrorsComponent } from "../../../../shared/components/list-errors.component";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { HttpClient } from "@angular/common/http";

interface ArticleForm {
  title: FormControl<string>;
  description: FormControl<string>;
  body: FormControl<string>;
}

@Component({
  selector: "app-editor-page",
  templateUrl: "./editor.component.html",
  imports: [ListErrorsComponent, ReactiveFormsModule, NgForOf, NgIf],
  standalone: true,
})
export default class EditorComponent implements OnInit {
  tagList: string[] = [];
  articleForm: UntypedFormGroup = new FormGroup<ArticleForm>({
    title: new FormControl("", { nonNullable: true }),
    description: new FormControl("", { nonNullable: true }),
    body: new FormControl("", { nonNullable: true }),
  });
  tagField = new FormControl<string>("", { nonNullable: true });

  errors: Errors | null = null;
  isSubmitting = false;
  destroyRef = inject(DestroyRef);
  imageSearchField = new FormControl<string>("", { nonNullable: true });
  imageResults: { url: string }[] = [];
  selectedImage: string | null = null;

  constructor(
    private readonly articleService: ArticlesService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly http: HttpClient,
  ) {}

  ngOnInit() {
    if (this.route.snapshot.params["slug"]) {
      combineLatest([
        this.articleService.get(this.route.snapshot.params["slug"]),
      ])
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(([article]) => {
          this.tagList = article.tagList;
          this.articleForm.patchValue(article);
          this.selectedImage = article.image || null;
        });
    }
  }

  addTag() {
    // retrieve tag control
    const tag = this.tagField.value;
    // only add tag if it does not exist yet
    if (tag != null && tag.trim() !== "" && this.tagList.indexOf(tag) < 0) {
      this.tagList.push(tag);
    }
    // clear the input
    this.tagField.reset("");
  }

  removeTag(tagName: string): void {
    this.tagList = this.tagList.filter((tag) => tag !== tagName);
  }

  searchImages(): void {
    const query = this.imageSearchField.value.trim();
    if (!query) return;

    const API_URL = `https://api.unsplash.com/search/photos?query=${query}&client_id=rveTWvNL9b9y7UCC82PBlhOFK4K_EbtDRsmwffJOiwI`;

    this.http.get<any>(API_URL).subscribe({
      next: (response) => {
        this.imageResults = response.results.map((img: any) => ({
          url: img.urls.small,
        }));
      },
      error: (error) => {
        console.error("Erreur API Unsplash :", error);
      },
    });
  }

  selectImage(image: { url: string }): void {
    this.selectedImage = image.url;
  }

  submitForm(): void {
    this.isSubmitting = true;

    this.addTag();

    const formData = {
      ...this.articleForm.value,
      tagList: this.tagList,
      image: this.selectedImage,
    };

    const slug = formData.title.toLowerCase().replace(/\s+/g, "-");

    this.articleService
      .delete(slug)
      .pipe(
        catchError((err) => {
          // If the article doesn't exist, continue
          if (err.status === 404) {
            return of(null);
          }
          return throwError(() => err);
        }),
        switchMap(() => this.articleService.create(formData)),
      )
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (article) => this.router.navigate(["/article/", article.slug]),
        error: (err) => {
          this.errors = err;
          this.isSubmitting = false;
        },
      });
  }
}
