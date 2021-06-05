import { Component, OnDestroy, OnInit } from '@angular/core'
import { Apollo, gql } from 'apollo-angular'
import { Subscription } from 'rxjs'

@Component({
  selector: 'ngx-start',
  templateUrl: './start.component.html',
  styleUrls: ['./start.component.scss']
})
export class StartComponent implements OnInit, OnDestroy {

  price: any
  blocks: any[]
  loading = true
  error: any

  txs: any[]

  dataSubscription: Subscription
  currentTimestamp

  dapps = [
    {
      name: 'Gene.finance',
      image: '/assets/dapps/genefinance.png',
      url: 'https://gene.finance',
    },
    {
      name: 'Stickers.art',
      image: '/assets/dapps/stickers.png',
      url: 'https://stickers.art',
    },
    {
      name: 'OpenNFT.io',
      image: '/assets/dapps/opennft.png',
      url: 'https://opennft.io',
    },
  ]

  constructor(private apollo: Apollo) { }

  ngOnDestroy(): void {
    if (this.dataSubscription) {
      this.dataSubscription.unsubscribe()
    }
  }

  async ngOnInit() {
    this.currentTimestamp = Math.floor(Date.now()/1000);

    this.dataSubscription = this.apollo
      .watchQuery<any>({
        pollInterval: 10000,
        query: gql`
        {
          price{
            current_USD
            change7d_USD
            change24h_USD
            low24h_USD
            high_USD
          }
          blocks(query:{}, limit: 10, sort: "desc") {
            hash
            number
            timestamp
          }
          txs(query:{}, limit: 10, sort: "desc") {
            hash
            blockNumber
            from
          }
        }
      `,
      }).valueChanges.subscribe((response) => {
        this.currentTimestamp = Math.floor(Date.now()/1000);
        this.price = response.data?.price
        this.blocks = response.data?.blocks
        this.txs = response.data?.txs
        this.loading = response.loading
        this.error = response.error
      })
  }

}
