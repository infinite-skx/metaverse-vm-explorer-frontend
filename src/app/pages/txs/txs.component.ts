import { Component, OnInit } from '@angular/core'
import { Apollo, gql } from 'apollo-angular'

@Component({
  selector: 'ngx-blocks',
  templateUrl: './txs.component.html',
  styleUrls: ['./txs.component.scss']
})
export class TxsComponent implements OnInit {

  txs: any[]
  loading = true
  error: any
  currentTimestamp

  constructor(private apollo: Apollo) { }

  async ngOnInit() {

    this.currentTimestamp = Math.floor(Date.now()/1000);

    this.apollo
    .watchQuery<any>({
      pollInterval: 10000,
      query: gql`
        {
          txs(query:{}, limit: 10, sort: "desc") {
            hash
            confirmedAt
            from
            to
          }
        }
      `,
    }).valueChanges.subscribe((response)=>{
      this.currentTimestamp = Math.floor(Date.now()/1000);
      this.txs = response.data?.txs
      this.loading = response.loading
      this.error = response.error
    })

  }

}