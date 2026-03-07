import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Clock3,
  HeartHandshake,
  ImageIcon,
  ListTodo,
  Palette,
  PartyPopper,
  ShieldCheck,
  Sparkles,
  SplitSquareHorizontal,
  Target,
} from 'lucide-react';
import React from 'react';

import styles from './ParentGuidePage.module.css';

interface ParentGuidePageProps {
  onBack: () => void;
}

const featureCards = [
  {
    icon: Clock3,
    title: '時間が見えるビジュアルタイマー',
    description:
      'お子様には「進んでいる」が楽しく見え、保護者の方には残り時間をいっしょに確かめながら前向きに声をかけやすくなります。',
  },
  {
    icon: PartyPopper,
    title: 'ごほうびモード',
    description:
      '「終わったらうれしいことがある」をご家庭で共有しやすくなり、やりたくないタスクにも前向きな気持ちで取り組みやすくなります。',
  },
  {
    icon: Target,
    title: '目標時刻モード',
    description:
      '保護者の方が時間の見通しを持ちながら、お子様には無理なくゴールを示せます。時計を読む力より、納得して進める流れを大切にしています。',
  },
  {
    icon: SplitSquareHorizontal,
    title: 'きょうだいモード',
    description:
      '兄弟それぞれの目標を同じ画面で見守れるので、家族全体の進み方をそろえやすく、声かけも前向きに保ちやすくなります。',
  },
];

const reassurancePoints = [
  'やることリストは保存してくり返し使えるので、毎回ゼロから決め直さずにご家庭の約束を続けやすくなります。',
  'タイマーの形や色を変えられるので、お子さまに合う「楽しい」「やってみたい」を見つけやすくなります。',
  'データはブラウザ内の LocalStorage のみに保存され、外部送信されないため、ご家庭の中で安心して使えます。',
];

const decisionGuideSteps = [
  {
    icon: Palette,
    title: '1. どーなつタイマーの色や形を決める',
    description:
      'やることリストを実行中でも変更できるため、その日の気分に合わせて自由に変えられます。お子様が自分で選び、小さな決定を積み重ねていく体験を大切にしています。',
  },
  {
    icon: ImageIcon,
    title: '2. 画像（アイコン）を決める',
    description:
      'お子様自身の写真や、好きなキャラクターの画像など、自由な発想で設定していただくのがおすすめです。少しふざけた決め方でも、すぐに直さず、まずはそのまま使ってみることで「自分で決めた」実感につながります。',
  },
  {
    icon: PartyPopper,
    title: '3. ごほうびを決める',
    description:
      'やることが終わった後のごほうびも、お子様自身に決めてもらうことをおすすめします。「これを楽しみにがんばりたい」と思える内容にすることで、やることへの意欲が高まりやすくなります。',
  },
  {
    icon: Clock3,
    title: '4. やることの時間を決める',
    description:
      '「おきがえは何分くらいでできるかな？」「いつもなら大体5分くらいかかってるかな？」のようにヒントを出しながら、いっしょに時間を決めてみてください。ごほうび時間が増えすぎる場合は、目標時刻モードで調整しやすくなります。',
  },
  {
    icon: ListTodo,
    title: '5. やることを決める',
    description:
      'お子様自身が「次に何をするのか」を考えながら、やることを決めていきます。迷っているときは答えを先に伝えるより、「この後なにをするんだっけ？」「あさはいつも何しているかな？」と、思い出すきっかけを渡してあげてください。',
  },
];

export const ParentGuidePage: React.FC<ParentGuidePageProps> = ({ onBack }) => (
  <div className={styles.page}>
    <motion.div
      className={styles.heroBackdrop}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    />

    <div className={styles.container}>
      <motion.button
        className={styles.backButton}
        onClick={onBack}
        whileHover={{ x: -3 }}
        whileTap={{ scale: 0.98 }}
        aria-label="やることリスト選択へ戻る"
      >
        <ArrowLeft size={20} />
        <span>リスト選択へもどる</span>
      </motion.button>

      <motion.header
        className={styles.hero}
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
      >
        <div className={styles.kicker}>
          <HeartHandshake size={18} />
          <span>保護者向けガイド</span>
        </div>
        <h1>「やりたくない」から「楽しい」「うれしい」「やってみたい」へ</h1>
        <p className={styles.heroText}>
          どーなつタイマーは、お子様が目標に対して前向きに取り組むためのタイマーです。
          ご家庭でいっしょにやることを決めながらも、お子様自身が「やってみよう」と思える流れを大切にし、協力しながら毎日の支度や宿題に取り組めることを目指しています。
        </p>
      </motion.header>

      <motion.section
        className={styles.conceptPanel}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.45 }}
      >
        <div className={styles.sectionHeading}>
          <Sparkles size={20} />
          <h2>コンセプト</h2>
        </div>
        <p>
          モチベーション理論の一つである「自己決定理論（SDT）」の考え方をもとに、お子様の主体性を第一に考えています。保護者の方が一方的に押し付けるのではなく、
          お子様が自ら目標を選んだり決めたりする補助になることを大切にしています。始めやすい、続けやすい、終わりやすい流れの中で、
          小さな「できた」を重ね、やりたくないタスクにも前向きに向き合える体験を支えます。
        </p>
      </motion.section>

      <section className={styles.section}>
        <div className={styles.sectionHeading}>
          <Target size={20} />
          <h2>できること</h2>
        </div>
        <div className={styles.featureGrid}>
          {featureCards.map(({ icon: Icon, title, description }, index) => (
            <motion.article
              key={title}
              className={styles.featureCard}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.16 + index * 0.06, duration: 0.45 }}
            >
              <div className={styles.featureIcon}>
                <Icon size={26} />
              </div>
              <h3>{title}</h3>
              <p>{description}</p>
            </motion.article>
          ))}
        </div>
      </section>

      <motion.section
        className={styles.reassurancePanel}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.36, duration: 0.45 }}
      >
        <div className={styles.sectionHeading}>
          <ShieldCheck size={20} />
          <h2>安心して使える点</h2>
        </div>
        <ul className={styles.reassuranceList}>
          {reassurancePoints.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
      </motion.section>

      <motion.section
        className={styles.coachingPanel}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.42, duration: 0.45 }}
      >
        <div className={styles.sectionHeading}>
          <HeartHandshake size={20} />
          <h2>保護者の方へのおすすめの関わり方</h2>
        </div>
        <div className={styles.coachingIntro}>
          <p>
            お子様の成長に合わせて、お子様自身が決めていく領域を少しずつ増やしていくことをおすすめします。つい口を出したくなる場面でも、できるだけ見守り、お子様の決めた内容を尊重してあげてください。
          </p>
          <p>
            このアプリは、お子様が小さな決定を積み重ねながら主体的に行動できるように設計されています。完璧にできることよりも、「自分で決める経験」を増やしていくことを大切にしています。
          </p>
        </div>

        <div className={styles.decisionGuideGrid}>
          {decisionGuideSteps.map(({ icon: Icon, title, description }, index) => (
            <motion.article
              key={title}
              className={styles.decisionCard}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.48 + index * 0.05, duration: 0.4 }}
            >
              <div className={styles.decisionCardHeader}>
                <div className={styles.decisionIcon}>
                  <Icon size={22} />
                </div>
                <h3>{title}</h3>
              </div>
              <p>{description}</p>
            </motion.article>
          ))}
        </div>
      </motion.section>
    </div>
  </div>
);
