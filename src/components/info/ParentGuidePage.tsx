import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Clock3,
  HeartHandshake,
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
  '設定画面もお子様が関わりやすい見た目にしているため、保護者の方が一方的に決めるのではなく、いっしょに目標を立てやすくなります。',
  'タイマーの形や色を変えられるので、お子さまに合う「楽しい」「やってみたい」を見つけやすくなります。',
  '保護者の方には、お子様が主体的に決められるように支え、できたことをしっかりほめる伴走役でいてほしいと考えています。',
  'データはブラウザ内の LocalStorage のみに保存され、外部送信されないため、ご家庭の中で安心して使えます。',
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
        <h1>どーなつタイマーは、お子様が目標に対して前向きに取り組むためのタイマーです。</h1>
        <p className={styles.heroText}>
          お子様には「楽しい」「うれしい」「やってみたい」を、保護者の方には時間の見通しとポジティブなコミュニケーションを。
          ご家庭でいっしょにやることを決めながらも、お子様自身が「やってみよう」と思える流れを大切にし、
          協力しながら毎日の支度や宿題に取り組めることを目指しています。
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
          自己決定理論の考え方をもとに、お子様の主体性を第一に考えています。保護者の方が一方的に押し付けるのではなく、
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
    </div>
  </div>
);
