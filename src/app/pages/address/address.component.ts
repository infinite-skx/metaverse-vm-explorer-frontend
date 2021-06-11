import { Component, OnInit, ViewEncapsulation } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { Apollo, gql } from 'apollo-angular'
import { switchMap } from 'rxjs/operators'
import { TokenService } from '../../services/token.service'
import BN from 'bignumber.js'
@Component({
  selector: 'ngx-address',
  templateUrl: './address.component.html',
  styleUrls: ['./address.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AddressComponent implements OnInit {

  price: any
  address: any
  transactions = []
  contract: any
  mstTransfers = []
  initialLoading = true
  loadingTxs = false
  loadingMstTxs = false
  error: any
  info: any
  selectedTab: string
  tabsTitles = [
    'Transactions',
    'MST Transfers',
  ]
  mstBalances: any[] = []

  callResults: { [name: string]: any[] } = {}

  constructor(
    private apollo: Apollo,
    private activatedRoute: ActivatedRoute,
    private tokenService: TokenService,
  ) {
  }

  reset() {
    this.contract=undefined
    this.transactions = []
    this.initialLoading = true
    this.loadingTxs = false
    this.loadingMstTxs = false
    this.selectedTab = undefined
    this.mstBalances = []
  }

  async ngOnInit() {
    this.selectedTab = this.tabsTitles[0]
    this.activatedRoute.params
      .pipe(
        switchMap(params => {
          this.reset()
          return this.apollo
            .query<any>({
              variables: {
                address: params['address'],
              },
              query: gql`
          query($address: String)
          {
            price{
              current_USD
            }
            address(address: $address) {
              etpBalance
              address
              transactions(limit: 25, sort: "desc") {
                hash
                from
                to
                value
                confirmedAt
                blockNumber
              }
              mstTransfers(limit: 25, sort: "desc") {
                transactionHash
                from
                to
                value
                blockNumber
                confirmedAt
                tokenInfo {
                  symbol
                  decimals
                }
              }
              msts {
                address
                symbol
                decimals
                logoURI
                name
              }
              contract {
                contractName
                logoURI
                source
                abi
                bytecode
                creationTransaction{
                  hash
                  from
                  confirmedAt
                }
              }
            }
          }
          `,
            })
        })
      ).subscribe(async response => {
        this.price = response.data?.price
        this.address = response.data?.address
        this.transactions = this.address.transactions
        this.mstTransfers = this.address.mstTransfers
        if (response.data?.address.contract) {
          this.contract = {
            ...response.data?.address.contract,
            ...(response.data?.address.contract.abi && {
              abi: JSON.parse(response.data?.address.contract.abi).sort((a, b) => {
                if (a.stateMutability == b.stateMutability) {
                  return a.name >= b.name
                }
                return a.stateMutability < b.stateMutability
              })
            })
          }
        }
        this.mstBalances = await Promise.all(this.address.msts.map(async contract => {
          const balance = new BN(await this.tokenService.getMSTBalance(contract.address, this.address.address)).shiftedBy(-contract.decimals)
          return {
            ...contract,
            balance,
          }
        }))
          .then(msts => msts.filter((mst: any) => mst.balance.gt(0)))
        this.initialLoading = response.loading
        this.error = response.error
      })
  }

  onChangeTab(event) {
    this.selectedTab = event.tabTitle
  }

  scrollTx() {
    if (this.selectedTab == 'Transactions') {
      this.loadMoreTransactions()
    }
  }

  scrollMst() {
    if (this.selectedTab == 'MST Transfers') {
      this.loadMoreMstTransfers()
    }
  }

  loadMoreTransactions() {
    this.loadingTxs = true
    this.apollo
      .query<any>({
        variables: {
          address: this.address.address,
          startBlock: this.transactions[0] ? this.transactions[0].blockNumber + 0 : 0,
          offset: this.transactions.length
        },
        query: gql`
      query($address: String, $startBlock: Int!, $offset: Int!)
      {
        txs(query:{address: $address, blockNumber_lte: $startBlock}, limit: 25, sort: "desc", offset: $offset) {
          hash
          from
          to
          value
          confirmedAt
        }
      }
      `,
      }).subscribe((response) => {
        this.transactions = this.transactions.concat(response.data?.txs)
        this.loadingTxs = response.loading
        this.error = response.error
      })
  }



  loadMoreMstTransfers() {
    this.loadingMstTxs = true
    this.apollo
      .query<any>({
        variables: {
          address: this.address.address,
          startBlock: this.mstTransfers[0] ? this.mstTransfers[0].blockNumber + 0 : 0,
          offset: this.mstTransfers.length
        },
        query: gql`
      query($address: String, $startBlock: Int!, $offset: Int!)
      {
        mstTransfers(query:{address: $address, blockNumber_lte: $startBlock}, limit: 25, sort: "desc", offset: $offset) {
          transactionHash
          from
          to
          value
          blockNumber
          confirmedAt
          tokenInfo {
            symbol
            decimals
          }
        }
      }
      `,
      }).subscribe((response) => {
        this.mstTransfers = this.mstTransfers.concat(response.data?.mstTransfers)
        this.loadingMstTxs = response.loading
        this.error = response.error
      })
  }

}
