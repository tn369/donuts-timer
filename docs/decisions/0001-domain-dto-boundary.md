# 0001: Domain モデルと DTO の境界分離

- Status: Accepted
- Date: 2026-03-01

## Context

どーなつタイマーは UI 表示状態・LocalStorage 保存形式・ドメインルールの 3 つの関心を持ちます。  
これらを同一モデルで扱うと、表示都合や保存都合がドメイン判断へ混入し、仕様変更時に影響範囲が読みにくくなります。

特に次の問題が起きやすくなります。

- reducer 内でドメインルールを再実装して重複する
- 保存互換の都合がドメインモデルに侵入する
- テスト責務が曖昧になり、回帰時の原因切り分けが難しくなる

## Decision

次の方針を採用する。

1. `src/domain/timer/model.ts` をドメインモデルの正とする。
2. `src/types.ts` は UI/Storage 境界の DTO 契約として扱う。
3. Domain <-> DTO 変換は `factories/` と `mappers/` に集約する。
4. `useTaskTimer/reducer.ts` はオーケストレーション専任とし、ドメインロジック再実装を禁止する。
5. LocalStorage の既存保存フォーマットは、境界変換で互換維持する。

## Consequences

### Positive

- ドメインルールの配置が明確になり、変更時の影響範囲を限定できる。
- テストを Domain 層中心に組み立てやすくなる。
- reducer はユースケース制御に集中でき、可読性が上がる。

### Negative

- 変換コード（Factory/Mapper）のメンテナンスコストが増える。
- 小さな変更でも境界の追従が必要になる場合がある。

## Alternatives considered

1. DTO を唯一のモデルとして統一する。
2. reducer で変換と判定を直接持つ。

いずれも初期実装コストは下がるが、機能追加時に責務混在が進みやすいため採用しない。
