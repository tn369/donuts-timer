# ADR 一覧

このディレクトリは、Architecture Decision Record (ADR) を管理します。  
ADR は「なぜこの設計判断をしたか」を将来に残すための記録です。

## ステータス定義

- `Proposed`: 提案中
- `Accepted`: 採用済み
- `Superseded`: 後続 ADR に置き換え済み

## 命名規則

- ファイル名: `NNNN-short-title.md`
- 例: `0001-domain-dto-boundary.md`

## 必須テンプレート

各 ADR は最低限、次の見出しを含めます。

1. `Context`
2. `Decision`
3. `Consequences`
4. `Alternatives considered`

## 運用ルール

1. 1 つの主要判断に対して 1 ADR を作成する。
2. 新しい ADR を追加したら、この一覧に追記する。
3. 既存判断を置き換える場合は、旧 ADR を `Superseded` に更新する。

## ADR インデックス

- [0001: Domain モデルと DTO の境界分離](./0001-domain-dto-boundary.md)
