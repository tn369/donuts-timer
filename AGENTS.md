# AGENTS.md

このドキュメントは、本プロジェクト（どーなつタイマー）の開発に参加するAIエージェントのためのガイドラインです。

## 1. アプリケーションの概要

**どーなつタイマー 🍩** は、お子様が楽しく「やること」を終わらせられるようにデザインされた視覚的なタイマーアプリケーションです。

### 主な機能

- **ビジュアルタイマー**: 時間の経過をドーナツが欠けていくアニメーションで表現。
- **ごほうびモード**: タスクを早く終えると「あそぶ時間」が増えるゲーミフィケーション。
- **目標時刻モード**: 終了予定時刻から逆算して、現在の自由時間を算出。
- **きょうだいモード**: 二人同時の画面分割タイマー。
- **カスタマイズ**: タイマーの形状（星型、六角形など）や色の変更が可能。
- **プライバシー**: データは LocalStorage にのみ保存。

## 2. 技術スタック

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Vanilla CSS, Framer Motion (アニメーション), Lucide React (アイコン)
- **Testing**: Vitest, React Testing Library
- **Lint/Format**: ESLint, Prettier, Stylelint
- **PWA**: vite-plugin-pwa によるオフライン対応

## 3. フォルダ構成

```text
/
├── .github/          # GitHub Actions ワークフロー
├── public/           # 静的資産
├── src/
│   ├── assets/       # 画像、フォントなどの資産
│   ├── components/   # React コンポーネント
│   ├── hooks/        # カスタムフック
│   ├── useTaskTimer/ # タイマーロジック
│   ├── utils/        # ユーティリティ関数
│   ├── App.tsx       # メインコンポーネント
│   ├── types.ts      # 型定義
│   └── storage.ts    # データ永続化ロジック
├── Makefile          # 開発用コマンド用
├── package.json      # 依存関係とスクリプト
└── tsconfig.json     # TypeScript 設定
```

## 4. 開発スタイル

### t-wada TDD スタイル

本プロジェクトでは **t-wada (和田 卓也) 氏の提唱する TDD (Test-Driven Development)** スタイルを尊重します。

1. **Red**: 失敗するテストを書く。
2. **Green**: テストをパスさせるための最小限の実装を行う。
3. **Refactor**: コードを整理し、重複を取り除く（テストが通る状態を維持する）。

> [!IMPORTANT]
> 「テストは、実装者の不安を自信に変えるためのもの」という考え方を重視し、意味のあるテストケースを記述してください。

### 各機能実装ごとの品質チェック

機能を実装するたびに（またはコミット前）、必ず以下のチェックを順次実行し、すべてがパスすることを確認してください。

1. **Lint**: `make lint` (ESLint & Stylelint)
2. **Format**: `make format` (Prettier)
3. **Type Check**: `make type-check` (TypeScript)
4. **Test**: `make test` (Vitest)
5. **Build**: `make build` (Vite production build)

これらが通らないコードを提出しないでください。

### ユビキタス言語のメンテナンス

用語定義は `UBIQUITOUS_LANGUAGE.md` を正とします。  
次のいずれかに該当する変更では、同一PRで用語定義を更新してください。

1. ユーザー向けの新しい概念・モード・状態を追加したとき
2. 既存用語の意味や表示文言を変更したとき
3. ドメインモデル（`src/domain/timer/model.ts`）またはDTO（`src/types.ts`）に主要概念を追加/変更したとき

実装時の確認項目:

1. 正規用語（日本語）と実装語（英語/型名）の対応が `UBIQUITOUS_LANGUAGE.md` にある
2. README のドキュメント導線から参照できる
3. レビュー時に「用語定義更新の有無」を確認する

### DDD 設計方針

1. **Domain モデルは App DTO から独立させる**
   - `src/domain/timer/model.ts` の型をドメインの正とする。
   - `src/types.ts` は UI / Storage との入出力契約（DTO）として扱う。

2. **Entity は関数ベースで実装する**
   - 本プロジェクトでは React + reducer の immutable 更新を優先するため、Entity はクラス必須ではなく純関数で表現する。
   - 状態遷移・選択制約などのドメインルールは `src/domain/timer/entities/` に集約する。

3. **境界で変換する（Factory / Mapper）**
   - App DTO と Domain の相互変換は `src/domain/timer/factories/`（および mapper ラッパー）に集約する。
   - reducer / policy / service 内で DTO を直接扱わない。

4. **互換性を維持する**
   - LocalStorage の既存保存フォーマットは維持し、保存時・復元時に境界変換で吸収する。
   - 外部公開 API（hook の戻り値・コンポーネントとの契約）は原則互換維持。

5. **ロジック配置の原則**
   - `policies/`: 複数 Entity をまたぐ計算・判定（例: ごほうび時間計算）。
   - `services/`: セッション復元などのユースケース単位の合成。
   - `useTaskTimer/reducer.ts`: オーケストレーション専任（ドメインロジックの再実装は禁止）。

6. **テスト方針**
   - 新しいドメインルール追加時は、まず `entities/` または `policies/` のユニットテストを先に追加（Red）。
   - reducer テストは振る舞いの非回帰確認に集中し、詳細ロジックの主検証はドメイン層テストで行う。
