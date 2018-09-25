import { Component, OnInit } from '@angular/core';
import { BooksService } from './services/books.service';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{
  title = 'day17-client';
  books = [];
  
  keyword = "";
  selectionType = "";

  selections = [
    { viewValue: "Book Title", value: "BT"},
    { viewValue: "Author", value: "A"},
    { viewValue: "Both", value: "B"}
  ]

  searchCriteria = {
    'offset':0,
    'limit':5,
    'keyword': '',
    'selectionType': ''
  }

  constructor(private bookSvc: BooksService){ }

  ngOnInit(){
    this.bookSvc.getAllBooks(this.searchCriteria).subscribe((results)=>{
      console.log(results);
      this.books = results;
    })
  }

  search(){
    console.log("subscribe backend...");
    this.searchCriteria.keyword = this.keyword;
    this.searchCriteria.selectionType = this.selectionType;

    this.bookSvc.getAllBooks(this.searchCriteria).subscribe((results)=>{
      console.log(results);
      this.books = results;
    })
  }
}
