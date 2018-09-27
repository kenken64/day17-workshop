import { Component, OnInit } from '@angular/core';
import { BooksService } from './services/books.service';
import { FormControl } from '@angular/forms';
import {Sort} from '@angular/material';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{
  title = 'day17-client';
  books = [];
  sortedData = [];
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
      this.sortedData = this.books.slice();
    })
  }

  sortData(sort: Sort) {
    console.log("sorting ...");
    const data = this.books.slice();
    if (!sort.active || sort.direction === '') {
      this.sortedData = data;
      return;
    }
    console.log(">>> " +JSON.stringify(data));
   
    this.sortedData = data.sort((a, b) => {
      console.log("data sort" + JSON.stringify(a));
      console.log("data sort" + JSON.stringify(b));
      const isAsc = sort.direction === 'asc';
      console.log(">>>" + sort.active);
      switch (sort.active) {
        case 'name': return compare(a.name, b.name, isAsc);
        case 'author': return compare(a.author, b.author, isAsc);
        case 'isbn': return compare(a.isbn, b.isbn, isAsc);
        case 'publish_year': return compare(a.publish_year, b.publish_year, isAsc);
        default: return 0;
      }
    });
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

function compare(a, b, isAsc) {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}

