import React from 'react';
import { motion } from 'framer-motion';
import styled from '@emotion/styled';
import { FiUser, FiMail, FiGithub, FiTwitter, FiInstagram, FiLinkedin, FiEdit } from 'react-icons/fi';
import { PageContainer } from '../components/blog/BlogComponents';

// 定义样式组件
const ProfileContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
  gap: 2rem;
  padding: 1rem 0;
`;

const ProfileHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;
  padding: 1.5rem;
  background: var(--bg-secondary);
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);

  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
    padding: 1.5rem 1rem;
  }
`;

const AvatarContainer = styled.div`
  position: relative;
`;

const Avatar = styled.div`
  width: 150px;
  height: 150px;
  border-radius: 50%;
  overflow: hidden;
  border: 4px solid var(--accent-color-alpha);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  @media (max-width: 768px) {
    width: 120px;
    height: 120px;
  }
`;

const EditAvatarButton = styled.button`
  position: absolute;
  bottom: 5px;
  right: 5px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--accent-color);
  color: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: scale(1.1);
    background: var(--accent-color-dark);
  }
`;

const ProfileInfo = styled.div`
  flex: 1;
`;

const UserName = styled.h1`
  font-size: 2rem;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
`;

const UserBio = styled.p`
  color: var(--text-secondary);
  margin-bottom: 1rem;
  line-height: 1.6;
`;

const SocialLinks = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;

  @media (max-width: 768px) {
    justify-content: center;
  }
`;

const SocialLink = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--bg-primary);
  color: var(--text-secondary);
  transition: all 0.2s ease;

  &:hover {
    background: var(--accent-color);
    color: white;
    transform: translateY(-3px);
  }
`;

const ProfileSection = styled.div`
  padding: 1.5rem;
  background: var(--bg-secondary);
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 0.5rem;

  svg {
    color: var(--accent-color);
  }
`;

const InfoItem = styled.div`
  display: flex;
  margin-bottom: 1rem;
`;

const InfoLabel = styled.div`
  min-width: 150px;
  font-weight: 600;
  color: var(--text-primary);
`;

const InfoValue = styled.div`
  flex: 1;
  color: var(--text-secondary);
`;

const EditButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-left: auto;
  padding: 0.5rem 1rem;
  background: var(--accent-color-alpha);
  color: var(--accent-color);
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: var(--accent-color);
    color: white;
  }
`;

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr 1fr;
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const StatCard = styled.div`
  padding: 1.5rem;
  background: var(--bg-primary);
  border-radius: 8px;
  text-align: center;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  }
`;

const StatNumber = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: var(--accent-color);
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  font-size: 0.9rem;
  color: var(--text-secondary);
`;

// 页面动画
const pageVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: 0.5 },
  },
};

const Profile: React.FC = () => {
  return (
    <PageContainer>
      <motion.div variants={pageVariants} initial="initial" animate="animate">
        <ProfileContainer>
          <ProfileHeader>
            <AvatarContainer>
              <Avatar>
                <img
                  src="https://foruda.gitee.com/avatar/1715931924378943527/5352827_adnaan_1715931924.png!avatar200"
                  alt="用户头像"
                />
              </Avatar>
              <EditAvatarButton>
                <FiEdit size={16} />
              </EditAvatarButton>
            </AvatarContainer>

            <ProfileInfo>
              <UserName>Adnaan</UserName>
              <UserBio>
                全栈开发者，热爱编程和技术分享。专注于React、Vue和Node.js生态系统，喜欢探索新技术并分享学习心得。
              </UserBio>

              <SocialLinks>
                <SocialLink href="https://github.com" target="_blank" rel="noopener noreferrer">
                  <FiGithub size={18} />
                </SocialLink>
                <SocialLink href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                  <FiTwitter size={18} />
                </SocialLink>
                <SocialLink href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
                  <FiLinkedin size={18} />
                </SocialLink>
                <SocialLink href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                  <FiInstagram size={18} />
                </SocialLink>
              </SocialLinks>
            </ProfileInfo>
          </ProfileHeader>

          <ProfileSection>
            <div
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}
            >
              <SectionTitle>
                <FiUser size={20} /> 个人信息
              </SectionTitle>
              <EditButton>
                <FiEdit size={16} /> 编辑资料
              </EditButton>
            </div>

            <InfoItem>
              <InfoLabel>用户名</InfoLabel>
              <InfoValue>adnaan</InfoValue>
            </InfoItem>

            <InfoItem>
              <InfoLabel>真实姓名</InfoLabel>
              <InfoValue>张三</InfoValue>
            </InfoItem>

            <InfoItem>
              <InfoLabel>邮箱</InfoLabel>
              <InfoValue>example@example.com</InfoValue>
            </InfoItem>

            <InfoItem>
              <InfoLabel>职业</InfoLabel>
              <InfoValue>全栈开发工程师</InfoValue>
            </InfoItem>

            <InfoItem>
              <InfoLabel>所在地</InfoLabel>
              <InfoValue>北京, 中国</InfoValue>
            </InfoItem>

            <InfoItem>
              <InfoLabel>个人网站</InfoLabel>
              <InfoValue>https://adnaan.dev</InfoValue>
            </InfoItem>

            <InfoItem>
              <InfoLabel>加入时间</InfoLabel>
              <InfoValue>2024年5月15日</InfoValue>
            </InfoItem>
          </ProfileSection>

          <ProfileSection>
            <SectionTitle>
              <FiUser size={20} /> 统计数据
            </SectionTitle>

            <StatsContainer>
              <StatCard>
                <StatNumber>42</StatNumber>
                <StatLabel>发布的文章</StatLabel>
              </StatCard>

              <StatCard>
                <StatNumber>158</StatNumber>
                <StatLabel>收到的点赞</StatLabel>
              </StatCard>

              <StatCard>
                <StatNumber>36</StatNumber>
                <StatLabel>收藏的文章</StatLabel>
              </StatCard>

              <StatCard>
                <StatNumber>89</StatNumber>
                <StatLabel>评论数</StatLabel>
              </StatCard>
            </StatsContainer>
          </ProfileSection>
        </ProfileContainer>
      </motion.div>
    </PageContainer>
  );
};

export default Profile;
