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
