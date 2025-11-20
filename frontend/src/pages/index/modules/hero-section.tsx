import React, { useState } from 'react';
import styled from '@emotion/styled';
import { motion, Variants } from 'framer-motion';
import { FiGithub, FiMail, FiCode } from 'react-icons/fi';
import { useAnimationEngine, useSpringInteractions } from '@/utils/ui/animation';
import { Icon } from '@/components/common/icon';
import { WaveText } from '@/components/common';
import { SiteSettings } from '@/types';

// ==================== Styled Components ====================

const Section = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;

  @media (max-width: 768px) {
    padding-bottom: 2rem;
    min-height: auto;
  }
`;

const HeroContainer = styled(motion.div)`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  flex: 1;
  padding-top: 2rem;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 2rem;
    margin-bottom: 2rem;
    padding-top: 1rem;
  }
`;

const HeroContent = styled(motion.div)`
  max-width: 800px;
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem 0;

  &::before {
    content: '';
    position: absolute;
    top: -10px;
    left: -30px;
    width: 80px;
    height: 80px;
    background: radial-gradient(circle, var(--accent-color-alpha) 0%, transparent 70%);
    border-radius: 50%;
    opacity: 0.6;
    z-index: -1;
    filter: blur(10px);
  }

  @media (max-width: 768px) {
    max-width: 100%;
    text-align: center;
    order: 2;
    padding: 0;

    &::before {
      left: 50%;
      transform: translateX(-50%);
    }
  }
`;

const HeroImage = styled(motion.div)`
  width: 320px;
  height: 450px;
  position: relative;
  z-index: 1;
  perspective: 1000px;
  perspective-origin: center center;

  @media (max-width: 768px) {
    width: 280px;
    height: 380px;
    order: 1;
    margin-bottom: 1rem;
  }
`;

const ProfileCard = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  transform-style: preserve-3d;
  transform-origin: center center;
  transition: transform 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  border-radius: 16px;
  box-shadow:
    0 8px 32px rgba(var(--accent-rgb), 0.2),
    0 4px 16px rgba(0, 0, 0, 0.1),
    0 0 0 1px rgba(255, 255, 255, 0.1);
  cursor: pointer;
  will-change: transform;

  &:hover:not(.flipped) {
    transform: translateY(-8px);
    box-shadow:
      0 16px 48px rgba(var(--accent-rgb), 0.3),
      0 8px 24px rgba(0, 0, 0, 0.15),
      0 0 0 1px rgba(255, 255, 255, 0.2);
  }

  &.flipped {
    transform: rotateY(180deg);
  }

  @media (prefers-reduced-motion: reduce) {
    &.flipped {
      transform: rotateY(180deg);
    }
  }
`;

const CardFace = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
  border-radius: 16px;
  overflow: hidden;
`;

const CardFront = styled(CardFace)`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.5rem 1rem;
  transform: rotateY(0deg);
`;

const CardBack = styled(CardFace)`
  transform: rotateY(180deg);
  display: flex;
  flex-direction: column;
`;

const CardBackContent = styled.div`
  padding: 1.2rem 1rem;
  overflow-y: auto;
  overflow-x: hidden;
  height: 100%;
  position: relative;
  z-index: 1;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(var(--accent-rgb), 0.3);
    border-radius: 2px;

    &:hover {
      background: rgba(var(--accent-rgb), 0.5);
    }
  }
`;

const CardTitle = styled.h4`
  font-size: 1.1rem;
  margin-bottom: 0.8rem;
  color: var(--text-primary);
  position: relative;
  padding-bottom: 0.4rem;

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 40px;
    height: 3px;
    background: linear-gradient(90deg, var(--accent-color), transparent);
    border-radius: 3px;
  }
`;

const SkillList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-top: 0.7rem;
  margin-bottom: 1.5rem;
`;

const SkillItem = styled.span`
  font-size: 0.8rem;
  padding: 0.3rem 0.6rem;
  background: rgba(var(--accent-rgb), 0.12);
  backdrop-filter: blur(12px) saturate(180%);
  -webkit-backdrop-filter: blur(12px) saturate(180%);
  border-radius: 6px;
  color: var(--accent-color);
  border: 1px solid rgba(255, 255, 255, 0.25);
  box-shadow:
    0 2px 8px rgba(var(--accent-rgb), 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    background: rgba(var(--accent-rgb), 0.18);
    transform: translateY(-1px);
    box-shadow:
      0 4px 12px rgba(var(--accent-rgb), 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.4);
  }

  [data-theme='dark'] & {
    background: rgba(var(--accent-rgb), 0.15);
    border: 1px solid rgba(255, 255, 255, 0.2);
    box-shadow:
      0 2px 8px rgba(0, 0, 0, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.15);

    &:hover {
      background: rgba(var(--accent-rgb), 0.22);
      box-shadow:
        0 4px 12px rgba(0, 0, 0, 0.4),
        inset 0 1px 0 rgba(255, 255, 255, 0.2);
    }
  }
`;

const ProfileImage = styled.div`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid rgba(255, 255, 255, 0.5);
  margin-bottom: 1.2rem;
  flex-shrink: 0;
  box-shadow:
    0 8px 24px rgba(var(--accent-rgb), 0.3),
    0 4px 12px rgba(0, 0, 0, 0.1),
    inset 0 2px 4px rgba(255, 255, 255, 0.3);
  position: relative;
  z-index: 1;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: all 0.5s ease;
  }

  [data-theme='dark'] & {
    border: 3px solid rgba(255, 255, 255, 0.3);
    box-shadow:
      0 8px 24px rgba(0, 0, 0, 0.4),
      0 4px 12px rgba(var(--accent-rgb), 0.2),
      inset 0 2px 4px rgba(255, 255, 255, 0.15);
  }
`;

const ProfileName = styled.h3`
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: 0.4rem;
  background: linear-gradient(90deg, var(--accent-color), var(--accent-color-assistant));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-align: center;
`;

const ProfileTitle = styled.div`
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin-bottom: 1.2rem;
  text-align: center;
`;

const ProfileInfoList = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
`;

const ProfileInfoItem = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  padding-bottom: 0.4rem;
  border-bottom: 1px dashed var(--border-color);

  &:last-child {
    border-bottom: none;
  }

  span:first-of-type {
    color: var(--text-secondary);
  }

  span:last-of-type {
    color: var(--text-primary);
    font-weight: 500;
  }
`;

const CardFlipHint = styled.div`
  position: absolute;
  bottom: 0.75rem;
  right: 0.75rem;
  font-size: 0.75rem;
  color: var(--text-secondary);
  opacity: 0.7;
  display: flex;
  align-items: center;
  gap: 0.3rem;

  svg {
    width: 14px;
    height: 14px;
  }
`;

const Title = styled(motion.h1)`
  font-size: 2.4rem;
  font-weight: 800;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 10px;
  letter-spacing: -0.5px;
  line-height: 1.1;

  &:after {
    content: '';
    display: block;
    position: absolute;
    bottom: -5px;
    left: 0;
    width: 40px;
    height: 4px;
    background: var(--accent-color);
    border-radius: 2px;
    transform: translateY(20px);
    opacity: 0;

    @media (max-width: 768px) {
      left: 50%;
      transform: translateX(-50%) translateY(20px);
    }
  }

  .wave {
    display: inline-block;
    animation: wave 2.5s ease-in-out infinite;
    transform-origin: 70% 70%;
  }

  @keyframes wave {
    0% {
      transform: rotate(0deg);
    }
    10% {
      transform: rotate(14deg);
    }
    20% {
      transform: rotate(-8deg);
    }
    30% {
      transform: rotate(14deg);
    }
    40% {
      transform: rotate(-4deg);
    }
    50% {
      transform: rotate(10deg);
    }
    60% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(0deg);
    }
  }

  @media (max-width: 768px) {
    font-size: 2rem;
    justify-content: center;
    flex-wrap: wrap;
  }
`;

const Subtitle = styled(motion.h2)`
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1.2rem;
  line-height: 1.3;
  position: relative;

  code {
    font-family: var(--font-code);
    background: rgba(81, 131, 245, 0.08);
    padding: 0.2em 0.4em;
    border-radius: 4px;
    font-size: 0.85em;
    margin-left: 0.5em;
    border: 1px solid rgba(81, 131, 245, 0.1);
  }

  @media (max-width: 768px) {
    font-size: 1.3rem;
  }
`;

const Description = styled(motion.p)`
  font-size: 1.1rem;
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 1.5rem;
  max-width: 90%;

  @media (max-width: 768px) {
    max-width: 100%;
  }
`;

const SkillTags = styled(motion.div)`
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  color: var(--text-secondary);
  display: flex;
  gap: 0.8rem;
  opacity: 0.85;

  @media (max-width: 768px) {
    justify-content: center;
    flex-wrap: wrap;
  }

  span {
    display: flex;
    align-items: center;
    gap: 4px;
  }
`;

const SocialLinks = styled(motion.div)`
  display: flex;
  gap: 0.85rem;
  margin-top: 5rem;
  position: relative;

  &:before {
    content: '';
    position: absolute;
    top: -1rem;
    left: 0;
    width: 3rem;
    height: 1px;
    background: var(--border-color);

    @media (max-width: 768px) {
      left: 50%;
      transform: translateX(-50%);
    }
  }

  @media (max-width: 768px) {
    justify-content: center;
    margin-top: 3rem;
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

const Quote = styled(motion.div)`
  color: var(--text-secondary);
  font-style: italic;
  font-size: 0.9rem;
  opacity: 0.8;
  text-align: center;
  padding: 1rem 0;
  margin-bottom: 0.5rem;
`;

const ScrollIndicator = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
  width: 100%;
  color: var(--text-secondary);
  opacity: 0.7;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 5rem;

  svg {
    width: 28px;
    height: 40px;
  }

  @media (max-width: 768px) {
    margin-bottom: 2rem;
    padding-bottom: 2rem;
    svg {
      width: 24px;
      height: 32px;
    }
  }
`;

const AnimatedChar = styled(motion.span)`
  display: inline-block;
`;

const mouseScrollVariants: Variants = {
  initial: { opacity: 0.5, y: 0 },
  animate: {
    opacity: [0.5, 1, 0.5],
    y: [0, 5, 0],
    transition: {
      repeat: Infinity,
      duration: 1.5,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

const scrollWheelVariants: Variants = {
  initial: { opacity: 0.5, scaleY: 1 },
  animate: {
    opacity: [0.5, 1, 0.5],
    scaleY: [1, 0.7, 1],
    transition: {
      repeat: Infinity,
      duration: 1.5,
      ease: [0.4, 0, 0.2, 1],
      delay: 0.2,
    },
  },
};

// ==================== Component ====================

interface HeroSectionProps {
  siteSettings?: SiteSettings | null;
  loading?: boolean;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ siteSettings }) => {
  const { variants, springPresets } = useAnimationEngine();
  const socialInteractions = useSpringInteractions({
    hoverScale: 1.1,
    hoverY: -3,
    tapScale: 0.95,
    stiffness: 260,
    damping: 12,
  });

  // 按行显示控制
  const [showLine1, setShowLine1] = useState(true);
  const [showLine2, setShowLine2] = useState(false);
  const [showLine3, setShowLine3] = useState(false);
  const [showLine4, setShowLine4] = useState(false);
  const [showRest, setShowRest] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);

  const handleCardFlip = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <Section>
      <HeroContainer>
        <HeroContent>
          {/* 第1行 */}
          <Title>
            <motion.span
              variants={variants.waveContainer}
              initial="hidden"
              animate={showLine1 ? 'visible' : 'hidden'}
              style={{ display: 'inline-block' }}
              onAnimationComplete={(definition: any) => {
                if (definition === 'visible' && showLine1) {
                  setShowLine2(true);
                }
              }}
            >
              {'欢迎踏入代码与创意交织的'.split('').map((char, index) => (
                <AnimatedChar key={index} variants={variants.waveChar}>
                  {char}
                </AnimatedChar>
              ))}{' '}
              <span style={{ color: 'var(--accent-color)' }}>
                {'奇幻宇宙'.split('').map((char, index) => (
                  <AnimatedChar key={`highlight-${index}`} variants={variants.waveChar}>
                    {char}
                  </AnimatedChar>
                ))}
              </span>
            </motion.span>
            <motion.span
              className="wave"
              initial={{ opacity: 0, scale: 0 }}
              animate={showLine1 ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
              transition={{ delay: showLine1 ? 0.5 : 0, ...springPresets.snappy }}
              style={{
                display: 'inline-block',
                fontSize: '0.8em',
              }}
            >
              🌌
            </motion.span>
          </Title>

          {/* 第2行 */}
          <Subtitle initial={{ opacity: 0 }} animate={showLine2 ? { opacity: 1 } : { opacity: 0 }}>
            <motion.span
              variants={variants.waveContainer}
              initial="hidden"
              animate={showLine2 ? 'visible' : 'hidden'}
              style={{ display: 'inline-block' }}
              onAnimationComplete={(definition: any) => {
                if (definition === 'visible' && showLine2) {
                  setShowLine3(true);
                }
              }}
            >
              {'在代码与设计的交界，创造数字诗篇'.split('').map((char, index) => (
                <AnimatedChar
                  key={index}
                  variants={variants.waveChar}
                  style={{
                    background: 'linear-gradient(90deg, rgb(var(--gradient-from)), rgb(var(--gradient-to)))',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  {char}
                </AnimatedChar>
              ))}
              <AnimatedChar variants={variants.waveChar}> </AnimatedChar>
              <motion.code
                variants={variants.waveChar}
                style={{
                  display: 'inline-block',
                  color: 'var(--accent-color)',
                  fontFamily: 'var(--font-code)',
                  background: 'rgba(81, 131, 245, 0.08)',
                  padding: '0.2em 0.4em',
                  borderRadius: '4px',
                  fontSize: '0.85em',
                  marginLeft: '0.5em',
                  border: '1px solid rgba(81, 131, 245, 0.1)',
                }}
              >
                @adnaan
              </motion.code>
            </motion.span>
          </Subtitle>

          {/* 第3行 */}
          <Description initial={{ opacity: 0 }} animate={showLine3 ? { opacity: 1 } : { opacity: 0 }}>
            <motion.span
              variants={variants.waveContainer}
              initial="hidden"
              animate={showLine3 ? 'visible' : 'hidden'}
              style={{ display: 'inline' }}
              onAnimationComplete={(definition: any) => {
                if (definition === 'visible' && showLine3) {
                  setShowLine4(true);
                }
              }}
            >
              {'我是'.split('').map((char, i) => (
                <AnimatedChar key={i} variants={variants.waveChar}>
                  {char}
                </AnimatedChar>
              ))}
              <strong style={{ color: 'var(--accent-color)' }}>
                {'全栈工程师'.split('').map((char, i) => (
                  <AnimatedChar key={`s1-${i}`} variants={variants.waveChar}>
                    {char}
                  </AnimatedChar>
                ))}
              </strong>
              {'与'.split('').map((char, i) => (
                <AnimatedChar key={`and-${i}`} variants={variants.waveChar}>
                  {char}
                </AnimatedChar>
              ))}
              <strong style={{ color: 'var(--accent-color)' }}>
                {'UI/UX爱好者'.split('').map((char, i) => (
                  <AnimatedChar key={`s2-${i}`} variants={variants.waveChar}>
                    {char}
                  </AnimatedChar>
                ))}
              </strong>
              {'，专注于构建美观且高性能的Web体验。'.split('').map((char, i) => (
                <AnimatedChar key={`end-${i}`} variants={variants.waveChar}>
                  {char}
                </AnimatedChar>
              ))}
            </motion.span>
            <br />
            {/* 第4行 */}
            <motion.span
              initial={{ opacity: 0 }}
              animate={showLine4 ? { opacity: 1 } : { opacity: 0 }}
              style={{
                fontSize: '0.9em',
                opacity: 0.9,
                display: 'inline-block',
                position: 'relative',
                paddingBottom: '0.25rem',
              }}
            >
              <WaveText show={showLine4} onComplete={() => setShowRest(true)}>
                「每一行代码都有诗意，每一个像素都有故事」
              </WaveText>
              <motion.span
                initial={{ opacity: 0, scaleX: 0 }}
                animate={showLine4 ? { opacity: 0.3, scaleX: 1 } : { opacity: 0, scaleX: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  bottom: 0,
                  width: '100%',
                  height: '2px',
                  background: 'linear-gradient(90deg, var(--accent-color), transparent)',
                  transformOrigin: 'left',
                }}
              />
            </motion.span>
          </Description>

          <SkillTags initial="hidden" animate={showRest ? 'visible' : 'hidden'} variants={variants.stagger}>
            <motion.span variants={variants.listItem}>
              <FiCode size={14} /> 开发者
            </motion.span>
            <motion.span variants={variants.listItem}>
              <Icon name="helpCircle" size={14} /> 设计爱好者
            </motion.span>
            <motion.span variants={variants.listItem}>
              <Icon name="share" size={14} /> 终身学习者
            </motion.span>
          </SkillTags>

          <SocialLinks
            initial={{ opacity: 0, y: 10 }}
            animate={showRest ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
            transition={{ ...springPresets.gentle, delay: 0.2 }}
          >
            <SocialLink
              href={siteSettings?.socialLinks?.email ? `mailto:${siteSettings.socialLinks.email}` : undefined}
              aria-label="Email"
              initial={{ opacity: 1, scale: 1 }}
              {...socialInteractions}
            >
              <FiMail />
            </SocialLink>
            <SocialLink
              href={siteSettings?.socialLinks?.github}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              initial={{ opacity: 1, scale: 1 }}
              {...socialInteractions}
            >
              <FiGithub />
            </SocialLink>
            <SocialLink
              href={siteSettings?.socialLinks?.bilibili}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Bilibili"
              initial={{ opacity: 1, scale: 1 }}
              {...socialInteractions}
              style={{
                background: 'linear-gradient(135deg, rgba(var(--gradient-from), 0.08), rgba(var(--gradient-to), 0.08))',
              }}
            >
              <Icon name="bilibili" size={18} />
            </SocialLink>
            <SocialLink
              href={siteSettings?.socialLinks?.twitter}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Twitter"
              initial={{ opacity: 1, scale: 1 }}
              {...socialInteractions}
            >
              <Icon name="telegram" size={18} />
            </SocialLink>
            <SocialLink
              href={siteSettings?.socialLinks?.rss}
              aria-label="RSS Feed"
              initial={{ opacity: 1, scale: 1 }}
              {...socialInteractions}
            >
              <Icon name="rss" size={18} />
            </SocialLink>
          </SocialLinks>
        </HeroContent>

        <HeroImage
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={springPresets.bouncy}
        >
          <ProfileCard className={isFlipped ? 'flipped' : ''} onClick={handleCardFlip}>
            <CardFront className="glass glass-highlight">
              <ProfileImage>
                <img
                  src={
                    siteSettings?.avatar ||
                    'https://foruda.gitee.com/avatar/1745582574310382271/5352827_adnaan_1745582574.png!avatar100'
                  }
                  alt={siteSettings?.authorName || '头像'}
                />
              </ProfileImage>
              <ProfileName>{siteSettings?.authorName || ''}</ProfileName>
              <ProfileTitle>{siteSettings?.authorTitle || ''}</ProfileTitle>

              <ProfileInfoList>
                {siteSettings?.mbti && (
                  <ProfileInfoItem>
                    <span>MBTI</span>
                    <span>{siteSettings.mbti}</span>
                  </ProfileInfoItem>
                )}
                {siteSettings?.location && (
                  <ProfileInfoItem>
                    <span>地点</span>
                    <span>{siteSettings.location}</span>
                  </ProfileInfoItem>
                )}
                {siteSettings?.occupation && (
                  <ProfileInfoItem>
                    <span>职业</span>
                    <span>{siteSettings.occupation}</span>
                  </ProfileInfoItem>
                )}
                {siteSettings?.skills && siteSettings.skills.length > 0 && (
                  <ProfileInfoItem>
                    <span>技能</span>
                    <span>{siteSettings.skills.join(', ')}</span>
                  </ProfileInfoItem>
                )}
              </ProfileInfoList>

              <CardFlipHint>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M7 16l-4-4m0 0l4-4m-4 4h18"></path>
                </svg>
                点击翻转
              </CardFlipHint>
            </CardFront>

            <CardBack className="glass glass-highlight">
              <CardBackContent>
                <CardTitle>关于我</CardTitle>
                <p
                  style={{
                    fontSize: '0.85rem',
                    lineHeight: '1.5',
                    marginBottom: '0.8rem',
                    color: 'var(--text-secondary)',
                  }}
                >
                  {siteSettings?.authorBio || ''}
                </p>

                <CardTitle>技能标签</CardTitle>
                <SkillList>
                  {siteSettings?.skills?.map((skill, index) => (
                    <SkillItem key={index}>{skill}</SkillItem>
                  ))}
                </SkillList>

                <CardFlipHint>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
                  </svg>
                  返回正面
                </CardFlipHint>
              </CardBackContent>
            </CardBack>
          </ProfileCard>
        </HeroImage>
      </HeroContainer>

      <Quote initial={{ opacity: 0 }} animate={{ opacity: 0.8 }} transition={{ ...springPresets.floaty, delay: 0.5 }}>
        {siteSettings?.quote || ''} {siteSettings?.quoteAuthor && `—— ${siteSettings.quoteAuthor}`}
      </Quote>

      <ScrollIndicator>
        <motion.div initial="initial" animate="animate" variants={mouseScrollVariants}>
          <svg viewBox="0 0 28 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="1" y="1" width="26" height="38" rx="13" stroke="currentColor" strokeWidth="2" />
            <motion.rect x="12" y="10" width="4" height="8" rx="2" fill="currentColor" variants={scrollWheelVariants} />
          </svg>
        </motion.div>
      </ScrollIndicator>
    </Section>
  );
};
