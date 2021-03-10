import { Component, OnInit } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { ExplorerApiService } from '../../services/explorer-api.service'
import { map, switchMap } from 'rxjs/operators'
@Component({
  selector: 'app-block',
  templateUrl: './block.component.html',
  styleUrls: ['./block.component.scss']
})
export class BlockComponent implements OnInit {

  blockNo$ = this.activatedRoute.params
    .pipe(
      map(params => params.block)
    )

  block$ = this.blockNo$
    .pipe(
      switchMap((number) => this.explorer.getBlockByNumber(number))
    )

  transactions$ = this.blockNo$
    .pipe(
      switchMap((number) => this.explorer.listBlockTransactions(number))
    )

  constructor(
    private activatedRoute: ActivatedRoute,
    private explorer: ExplorerApiService,
  ) {
  }

  ngOnInit(): void {
  }

}