import React, { useEffect } from 'react';
import styled from '@emotion/styled';
import { motion, useAnimation, Variants } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiCalendar, FiClock, FiMessageCircle, FiGithub, FiMail } from 'react-icons/fi';

// 使用motion直接访问组件
const MotionDiv = motion.div;
const MotionH1 = motion.h1;
const MotionH2 = motion.h2;
const MotionP = motion.p;
const MotionSpan = motion.span;
const MotionLink = motion.create(Link);

// 动画变体定义
const fadeInUpVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: [0.23, 1, 0.32, 1] }
  }
};

const staggerContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const iconVariants: Variants = {
  hidden: { scale: 0, opacity: 0 },
  visible: { 
    scale: 1, 
    opacity: 1, 
    transition: { 
      type: "spring", 
      stiffness: 300, 
      damping: 15 
    } 
  }
};

const PageContainer = styled.div`
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 1rem;
`;

const Hero = styled(MotionDiv)`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10rem 0 10rem;
  position: relative;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 2rem;
    padding: 3rem 0 2rem;
  }
`;

const HeroContent = styled(MotionDiv)`
  max-width: 550px;
  position: relative;
  z-index: 1;
  
  @media (max-width: 768px) {
    max-width: 100%;
    text-align: center;
    order: 2;
  }
`;

const HeroImage = styled(MotionDiv)`
  width: 240px;
  height: 240px;
  border-radius: 50%;
  overflow: hidden;
  position: relative;
  z-index: 1;
  box-shadow: 0 8px 24px rgba(81, 131, 245, 0.2);
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  &:hover img {
    transform: scale(1.05);
  }
  
  @media (max-width: 768px) {
    width: 140px;
    height: 140px;
    order: 1;
  }
`;

const Title = styled(MotionH1)`
  font-size: 2.4rem;
  font-weight: 700;
  margin-bottom: 0.8rem;
  display: flex;
  align-items: center;
  gap: 10px;
  
  .wave {
    display: inline-block;
    animation: wave 2.5s ease-in-out infinite;
    transform-origin: 70% 70%;
  }
  
  @keyframes wave {
    0% { transform: rotate(0deg); }
    10% { transform: rotate(14deg); }
    20% { transform: rotate(-8deg); }
    30% { transform: rotate(14deg); }
    40% { transform: rotate(-4deg); }
    50% { transform: rotate(10deg); }
    60% { transform: rotate(0deg); }
    100% { transform: rotate(0deg); }
  }
  
  @media (max-width: 768px) {
    font-size: 1.8rem;
    justify-content: center;
  }
`;

const Subtitle = styled(MotionH2)`
  font-size: 1.8rem;
  font-weight: 600;
  margin-bottom: 0.8rem;
  
  code {
    font-family: var(--font-code);
  }
  
  @media (max-width: 768px) {
    font-size: 1.2rem;
  }
`;

const Description = styled(MotionP)`
  font-size: 1.2rem;
  color: var(--text-secondary);
  line-height: 1.5;
  margin-bottom: 1rem;
`;

const SocialLinks = styled(MotionDiv)`
  display: flex;
  gap: 0.75rem;
  margin-top: 1.25rem;
  
  @media (max-width: 768px) {
    justify-content: center;
  }
`;

const SocialLink = styled(motion.a)`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: var(--bg-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  
  &:hover {
    color: var(--accent-color);
    background-color: rgba(81, 131, 245, 0.06);
    box-shadow: inset 0 0 0 1px rgba(81, 131, 245, 0.1);
    transform: translateY(-2px);
  }
  
  svg {
    width: 18px;
    height: 18px;
  }
`;

const Quote = styled(MotionDiv)`
  color: var(--text-secondary);
  font-style: italic;
  font-size: 0.9rem;
  opacity: 0.8;
  text-align: center;
  padding: 1rem 0 1.5rem;
  border-bottom: 1px solid var(--border-color);
`;

const SectionTitle = styled(motion.h2)`
  font-size: 1.3rem;
  font-weight: 600;
  margin: 2rem 0 1.25rem;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  
  a {
    font-size: 0.85rem;
    color: var(--accent-color);
    display: flex;
    align-items: center;
    gap: 0.3rem;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

const ContentSection = styled(motion.section)`
  margin-bottom: 2.5rem;
`;

const ArticleGrid = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.25rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ArticleCard = styled(MotionLink)`
  background: var(--bg-primary);
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid var(--border-color);
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  display: flex;
  flex-direction: column;
  height: 100%;
  
  &:hover {
    background-color: rgba(81, 131, 245, 0.06);
    box-shadow: 0 8px 30px rgba(81, 131, 245, 0.1);
    transform: translateY(-3px);
  }
`;

const ArticleImage = styled.div`
  height: 160px;
  background-color: var(--bg-secondary);
  position: relative;
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
  }
  
  ${ArticleCard}:hover & img {
    transform: scale(1.08);
  }
`;

const ArticleContent = styled.div`
  padding: 1.2rem;
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const ArticleTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  line-height: 1.4;
  color: var(--text-primary);
`;

const ArticleMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin-bottom: 0.7rem;
  
  span {
    display: flex;
    align-items: center;
    gap: 0.3rem;
  }
`;

const ArticleExcerpt = styled.p`
  font-size: 0.85rem;
  color: var(--text-secondary);
  line-height: 1.5;
  margin-bottom: 1rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex: 1;
`;

const ReadMore = styled(MotionSpan)`
  font-size: 0.85rem;
  color: var(--accent-color);
  display: flex;
  align-items: center;
  gap: 0.3rem;
  margin-top: auto;
  font-weight: 500;
  
  svg {
    transition: transform 0.2s ease;
  }
  
  ${ArticleCard}:hover & svg {
    transform: translateX(4px);
  }
`;

const ActivitySection = styled(motion.section)`
  margin-bottom: 2.5rem;
`;

const ActivityList = styled(motion.div)`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const ActivityItem = styled(motion.div)`
  display: flex;
  gap: 0.75rem;
  padding: 1rem;
  border-radius: 12px;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  
  &:hover {
    background-color: rgba(81, 131, 245, 0.06);
    box-shadow: 0 8px 24px rgba(81, 131, 245, 0.08);
    transform: translateY(-2px) scale(1.01);
  }
`;

const ActivityIcon = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--bg-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--accent-color);
  flex-shrink: 0;
  font-size: 0.9rem;
  border: 1px solid rgba(81, 131, 245, 0.15);
`;

const ActivityContent = styled.div`
  flex: 1;
`;

const ActivityTitle = styled.h4`
  font-size: 0.9rem;
  font-weight: 500;
  margin-bottom: 0.3rem;
  
  a {
    color: var(--accent-color);
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

const ActivityTime = styled.div`
  font-size: 0.8rem;
  color: var(--text-secondary);
`;

const ChartSection = styled(motion.section)`
  margin: 2.5rem 0;
`;

const ChartContainer = styled(motion.div)`
  background: var(--bg-primary);
  border-radius: 12px;
  padding: 1.25rem;
  border: 1px solid var(--border-color);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
  
  [data-theme='dark'] & {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const ChartHeader = styled.div`
  margin-bottom: 1rem;
  font-size: 0.92rem;
  color: var(--text-secondary);
  font-weight: 500;
`;

const Chart = styled.div`
  height: 100px;
  display: flex;
  align-items: flex-end;
  gap: 3px;
  margin-top: 1rem;
  position: relative;
  
  &:after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 1px;
    background-color: var(--border-color);
    opacity: 0.6;
  }
`;

const ChartBar = styled(motion.div)<{ height: number }>`
  width: 6px;
  height: ${props => props.height}%;
  background-color: var(--accent-color);
  border-radius: 3px 3px 0 0;
  opacity: 0.8;
  transition: all 0.3s ease;
  position: relative;
  cursor: pointer;
  
  &:hover {
    opacity: 1;
    transform: scaleY(1.05);
    background-color: var(--accent-color);
  }
`;

const ChartLabels = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 0.75rem;
  font-size: 0.75rem;
  color: var(--text-secondary);
  opacity: 0.8;
`;

const SpecialSectionHeader = styled(motion.div)`
  text-align: center;
  margin: 3.5rem 0 2rem;
  
  h3 {
    font-size: 1.2rem;
    color: var(--text-primary);
    margin-bottom: 0.5rem;
    font-weight: 600;
  }
  
  p {
    font-size: 0.9rem;
    color: var(--text-secondary);
    opacity: 0.8;
  }
`;

// 文章卡片动画变体
const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.5,
      ease: [0.25, 1, 0.5, 1]
    }
  }
};

// 活动项目动画变体
const activityVariants: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { 
      duration: 0.4,
      ease: "easeOut"
    }
  }
};

// 图表条动画变体
const barVariants: Variants = {
  hidden: { scaleY: 0 },
  visible: (custom) => ({
    scaleY: 1,
    transition: { 
      duration: 0.5,
      delay: custom * 0.05,
      ease: [0.25, 1, 0.5, 1]
    }
  })
};

const mockArticles = [
  {
    id: 1,
    title: "使用React Native Screens 和 Native Navigation 提升应用性能",
    date: "2025-3-10",
    category: "技术",
    views: 630,
    excerpt: "探索如何利用React Native Screens和Native Navigation优化应用性能，减少启动时间。",
    image: "https://via.placeholder.com/600x400?text=React+Native"
  },
  {
    id: 2,
    title: "React Native 构建WebView与原生的深度集成",
    date: "2025-3-5",
    category: "开发",
    views: 415,
    excerpt: "详解React Native WebView组件与原生模块的集成方式，实现更流畅的用户体验。",
    image: "https://via.placeholder.com/600x400?text=WebView"
  },
  {
    id: 3,
    title: "在Expo中使用原生模块的完整指南",
    date: "2025-2-28",
    category: "教程",
    views: 527,
    excerpt: "一步步教你如何在Expo项目中集成和使用原生模块，突破Expo的限制。",
    image: "https://via.placeholder.com/600x400?text=Expo"
  }
];

const mockActivities = [
  {
    id: 1,
    type: "comment",
    title: "在《Monthly Issue - 2025.3》中发表了评论",
    time: "3天前"
  },
  {
    id: 2,
    type: "post",
    title: "发布了新文章《使用React Native Screens 和 Native Navigation 提升应用性能》",
    time: "6天前"
  },
  {
    id: 3,
    type: "like",
    title: "赞了文章《应用性能优化的12个技巧》",
    time: "1周前"
  }
];

const chartData = [
  { month: "2025.5", value: 35 },
  { month: "2025.6", value: 42 },
  { month: "2025.7", value: 55 },
  { month: "2025.8", value: 40 },
  { month: "2025.9", value: 68 },
  { month: "2025.10", value: 75 },
  { month: "2025.11", value: 82 },
  { month: "2025.12", value: 90 },
  { month: "2026.1", value: 60 },
  { month: "2026.2", value: 78 },
  { month: "2026.3", value: 65 },
  { month: "2026.4", value: 92 }
];

const Home = () => {
  // 使用动画控制器但简化，不使用InView
  const heroControls = useAnimation();
  const articlesControls = useAnimation();
  const activitiesControls = useAnimation();
  const chartControls = useAnimation();
  
  // 使用简单的timeout来触发动画，而不是基于视图
  useEffect(() => {
    // 简单的顺序动画
    heroControls.start('visible');
    
    const articleTimer = setTimeout(() => {
      articlesControls.start('visible');
    }, 300);
    
    const activitiesTimer = setTimeout(() => {
      activitiesControls.start('visible');
    }, 600);
    
    const chartTimer = setTimeout(() => {
      chartControls.start('visible');
    }, 900);
    
    return () => {
      clearTimeout(articleTimer);
      clearTimeout(activitiesTimer);
      clearTimeout(chartTimer);
    };
  }, [heroControls, articlesControls, activitiesControls, chartControls]);

  return (
    <PageContainer>
      <Hero>
        <HeroContent
          variants={staggerContainerVariants}
          initial="hidden"
          animate={heroControls}
        >
          <Title variants={fadeInUpVariants}>
            Hi, I'm adnaan <motion.span 
              className="wave" 
              variants={iconVariants}
              initial="hidden"
              animate="visible"
            >👋</motion.span>
          </Title>
          
          <Subtitle variants={fadeInUpVariants}>
            A NodeJS Full Stack <code>&lt;Developer /&gt;</code>
          </Subtitle>
          
          <Description variants={fadeInUpVariants}>
            An independent developer coding with love.
          </Description>
          
          <SocialLinks variants={staggerContainerVariants}>
            <SocialLink 
              href="mailto:example@example.com" 
              aria-label="Email"
              variants={iconVariants}
              whileHover={{ y: -3, scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <FiMail />
            </SocialLink>
            <SocialLink 
              href="https://github.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              aria-label="GitHub"
              variants={iconVariants}
              whileHover={{ y: -3, scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <FiGithub />
            </SocialLink>
            <SocialLink 
              href="https://bilibili.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              aria-label="Bilibili"
              variants={iconVariants}
              whileHover={{ y: -3, scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.813 4.653h.854c1.51.054 2.769.578 3.773 1.574 1.004.995 1.524 2.249 1.56 3.76v7.36c-.036 1.51-.556 2.769-1.56 3.773s-2.262 1.524-3.773 1.56H5.333c-1.51-.036-2.769-.556-3.773-1.56S.036 18.858 0 17.347v-7.36c.036-1.511.556-2.765 1.56-3.76 1.004-.996 2.262-1.52 3.773-1.574h.774l-1.174-1.12a1.234 1.234 0 0 1-.373-.906c0-.356.124-.658.373-.907l.027-.027c.267-.249.573-.373.92-.373.347 0 .653.124.92.373L9.653 4.44c.071.071.134.142.187.213h4.267a.836.836 0 0 1 .16-.213l2.853-2.747c.267-.249.573-.373.92-.373.347 0 .662.151.929.4.267.249.391.551.391.907 0 .355-.124.657-.373.906L17.813 4.653z" />
              </svg>
            </SocialLink>
            <SocialLink 
              href="https://twitter.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              aria-label="Twitter"
              variants={iconVariants}
              whileHover={{ y: -3, scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.96 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"></path>
              </svg>
            </SocialLink>
            <SocialLink 
              href="/rss.xml" 
              aria-label="RSS Feed"
              variants={iconVariants}
              whileHover={{ y: -3, scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 20.001C19 11.729 12.271 5 4 5v2c7.168 0 13 5.832 13 13.001h2z"></path>
                <path d="M12 20.001h2C14 14.486 9.514 10 4 10v2c4.411 0 8 3.589 8 8.001z"></path>
                <circle cx="6" cy="18" r="2"></circle>
              </svg>
            </SocialLink>
          </SocialLinks>
        </HeroContent>
        
        <HeroImage
          initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.23, 1, 0.32, 1] }}
          whileHover={{ scale: 1.05, rotate: 5 }}
          whileTap={{ scale: 0.95 }}
        >
          <img src="https://foruda.gitee.com/avatar/1715931924378943527/5352827_adnaan_1715931924.png!avatar200" alt="Innei" />
        </HeroImage>
      </Hero>
      
      <Quote
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.8 }}
        transition={{ duration: 0.8, delay: 0.5 }}
      >
        请保持理性，冰冷的数字总是比七彩门的炫法走得更久。 —— 猴哥蔡嵩
      </Quote>
      
      <ContentSection 
        variants={staggerContainerVariants}
        initial="hidden"
        animate={articlesControls}
      >
        <SectionTitle variants={fadeInUpVariants}>
          最近更新的文稿
          <motion.a 
            href="/blog" 
            whileHover={{ x: 5 }}
            variants={fadeInUpVariants}
          >
            查看全部 <FiArrowRight size={12} />
          </motion.a>
        </SectionTitle>
        
        <ArticleGrid variants={staggerContainerVariants}>
          {mockArticles.map((article, index) => (
            <ArticleCard 
              to={`/blog/${article.id}`} 
              key={article.id}
              variants={cardVariants}
              whileHover={{ y: -5 }}
              custom={index}
            >
              <ArticleImage>
                <img src={article.image} alt={article.title} />
              </ArticleImage>
              <ArticleContent>
                <ArticleTitle>{article.title}</ArticleTitle>
                <ArticleMeta>
                  <span><FiCalendar size={12} /> {article.date}</span>
                  <span><FiClock size={12} /> {article.views} 次阅读</span>
                </ArticleMeta>
                <ArticleExcerpt>{article.excerpt}</ArticleExcerpt>
                <ReadMore>
                  阅读更多 <FiArrowRight size={12} />
                </ReadMore>
              </ArticleContent>
            </ArticleCard>
          ))}
        </ArticleGrid>
      </ContentSection>
      
      <ActivitySection 
        variants={staggerContainerVariants}
        initial="hidden"
        animate={activitiesControls}
      >
        <SectionTitle variants={fadeInUpVariants}>
          最近发生的事
          <motion.a 
            href="/activities" 
            whileHover={{ x: 5 }}
            variants={fadeInUpVariants}
          >
            查看全部 <FiArrowRight size={12} />
          </motion.a>
        </SectionTitle>
        
        <ActivityList variants={staggerContainerVariants}>
          {mockActivities.map((activity, index) => (
            <ActivityItem 
              key={activity.id}
              variants={activityVariants}
              custom={index}
              whileHover={{ y: -3, x: 3 }}
            >
              <ActivityIcon>
                {activity.type === 'comment' && <FiMessageCircle size={16} />}
                {activity.type === 'post' && <FiCalendar size={16} />}
                {activity.type === 'like' && <span>❤️</span>}
              </ActivityIcon>
              <ActivityContent>
                <ActivityTitle>{activity.title}</ActivityTitle>
                <ActivityTime>{activity.time}</ActivityTime>
              </ActivityContent>
            </ActivityItem>
          ))}
        </ActivityList>
      </ActivitySection>
      
      <ChartSection 
        variants={staggerContainerVariants}
        initial="hidden"
        animate={chartControls}
      >
        <SectionTitle variants={fadeInUpVariants}>
          热力图
        </SectionTitle>
        
        <ChartContainer
          variants={fadeInUpVariants}
          whileHover={{ y: -3 }}
        >
          <ChartHeader>热力图的千篇一律，所以我做成了时间线</ChartHeader>
          <Chart>
            {chartData.map((item, index) => (
              <ChartBar 
                key={index} 
                height={item.value}
                custom={index}
                variants={barVariants}
                initial="hidden"
                animate="visible"
                whileHover={{ scaleY: 1.2, opacity: 1 }}
              />
            ))}
          </Chart>
          <ChartLabels>
            {chartData.map((item, index) => (
              index % 3 === 0 && <span key={index}>{item.month}</span>
            ))}
          </ChartLabels>
        </ChartContainer>
      </ChartSection>
      
      <SpecialSectionHeader
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
      >
        <motion.h3
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          viewport={{ once: true }}
        >
          风向标
        </motion.h3>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          viewport={{ once: true }}
        >
          去到别处看看？
        </motion.p>
      </SpecialSectionHeader>
    </PageContainer>
  );
};

export default Home;