import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { of } from 'rxjs'
import { catchError, map } from 'rxjs/operators'

export interface Attribute {
  trait_type: string
  value: any
}

export interface Metadata {
  id?: string
  name?: string
  description?: string
  image?: string
  external_url?: string
  attributes?: Attribute[]
  project?: any
  totalSupply?: string
  totalListed: string
  tokenId: string
}

@Injectable({
  providedIn: 'root'
})
export class TokenService {

  constructor(private http: HttpClient) { }

  getMetadata(uri: string, more: Object = {}) {
    return this.http.get<Metadata>(uri)
      .pipe(
        catchError(err => of({})),
        map(data => ({ ...more, ...data, }))
      )
  }
}
