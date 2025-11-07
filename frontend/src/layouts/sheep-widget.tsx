import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { useEffect } from 'react';
import { RootState } from '@/store';
import { useCompanionWidget } from '@/hooks/useCompanionWidget';
import {
  CareBubble,
  ParticlesContainer,
  StarParticle,
  PullLineIndicator,
  containerVariants,
  floatVariants,
  jumpVariants,
  blinkVariants,
} from '@/components/companion/companion-shared';

// ============================================================================
// 懒羊羊（白天陪伴物）
// ============================================================================

const SHEEP_WIDTH = 60;
const SHEEP_HEIGHT = 75;

// 容器
const SheepContainer = styled(motion.div)<{ isDragging?: boolean }>`
  position: fixed;
  z-index: 9999;
  width: ${SHEEP_WIDTH}px;
  height: ${SHEEP_HEIGHT}px;
  pointer-events: auto;
  cursor: ${(props) => (props.isDragging ? 'grabbing' : 'grab')};
  overflow: visible;
  user-select: none;
  will-change: left, top;
  filter: drop-shadow(0 2px 8px rgba(251, 146, 60, 0.2));
  touch-action: none;

  @media (max-width: 768px) {
    transform: scale(0.85);
  }
`;

// SVG 容器
const SheepSVG = styled(motion.svg)`
  width: 100%;
  height: 100%;
  overflow: visible;
`;

// 嘴巴动画
const mouthVariants = {
  normal: { scale: 1 },
  excited: {
    scale: [1, 1.2, 1],
    transition: {
      duration: 0.6,
      repeat: Infinity,
      repeatDelay: 2,
    },
  },
};

// ============================================================================
// 主组件
// ============================================================================

const SheepWidget = () => {
  const theme = useSelector((state: RootState) => state.theme.theme);
  const isDark = theme === 'dark';

  // 使用公共 Hook - 必须在条件返回之前调用
  const companion = useCompanionWidget({
    storageKey: 'cloud_sheep_position',
    width: SHEEP_WIDTH,
    height: SHEEP_HEIGHT,
    defaultPosition: { x: window.innerWidth - 120, y: window.innerHeight - 150 },
    enablePhysics: true,
    enableSmartBubble: true,
    bubbleIdleTime: 15000,
    bubbleInterval: 30000,
    blinkInterval: 3000,
  });

  // 触摸事件处理 - 必须在条件返回之前调用
  useEffect(() => {
    // 只在白天模式时设置事件监听器
    if (isDark) return;

    const element = companion.widgetRef.current;
    if (!element) return;

    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      companion.handlePullStart(touch.clientX, touch.clientY);
    };

    element.addEventListener('touchstart', handleTouchStart, { passive: false });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
    };
  }, [isDark, companion.isFlying, companion.handlePullStart]);

  // 只在白天显示 - 在所有 Hook 调用之后才返回
  if (isDark) return null;

  // 处理鼠标按下
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    companion.handlePullStart(e.clientX, e.clientY);
  };

  return (
    <>
      {/* 拉线指示器 */}
      <PullLineIndicator
        isPulling={companion.isPulling}
        pullStart={companion.pullStart}
        pullCurrent={companion.pullCurrent}
        pullDistance={companion.pullDistance}
        pullAngle={companion.pullAngle}
        isNearEdge={companion.isNearEdge}
        accentColor="rgba(251, 146, 60, 0.6)"
      />

      <SheepContainer
        ref={companion.widgetRef}
        isDragging={companion.isPulling}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        onMouseDown={handleMouseDown}
        onMouseEnter={() => companion.setIsHovered(true)}
        onMouseLeave={() => companion.setIsHovered(false)}
        onClick={companion.handleClick}
        style={{
          left: companion.position.x,
          top: companion.position.y,
          cursor: companion.isFlying ? 'default' : companion.isPulling ? 'grabbing' : 'grab',
        }}
      >
        {/* 关心气泡 */}
        {companion.careBubble && !companion.isPulling && !companion.isFlying && (
          <CareBubble
            variant="light"
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            transition={{ duration: 0.3 }}
          >
            {companion.careBubble}
          </CareBubble>
        )}

        <SheepSVG
          viewBox="-200 -200 400 600"
          preserveAspectRatio="xMidYMid meet"
          variants={companion.clickCount > 0 ? jumpVariants : floatVariants}
          animate={companion.clickCount > 0 ? (companion.clickCount >= 5 ? 'jump5x' : 'jump') : 'animate'}
        >
          {/* 脸部轮廓 */}
          <path
            d="M-131,-76 L-121,-85 L-112,-94 L-105,-105 L-113,-109 L-105,-106 L-97,-106 L-89,-106 L-83,-110 L-77,-115 L-69,-120 L-60,-118 L-53,-117 L-44,-117 L-35,-120 L-26,-126 L-17,-122 L-10,-117 L-3,-114 L6,-111 L16,-110 L26,-112 L32,-115 L36,-117 L42,-112 L47,-107 L53,-102 L61,-98 L71,-96 L80,-96 L89,-97 L98,-99 L104,-92 L108,-86 L114,-78 L121,-71 L128,-66 L139,-62 L138,-53 L138,-42 L139,-32 L143,-25 L149,-17 L154,-9 L157,-6 L154,-2 L152,1 L147,5 L143,12 L140,20 L138,28 L137,38 L139,46 L139,52 L132,57 L124,63 L120,70 L115,76 L113,86 L109,96 L100,103 L94,111 L90,119 L89,125 L90,131 L94,137 L97,142 L93,149 L87,150 L71,153 L55,156 L42,156 L28,157 L12,157 L-2,155 L-16,153 L-27,151 L-37,147 L-50,144 L-61,140 L-71,137 L-82,133 L-91,126 L-102,119 L-112,111 L-120,102 L-127,94 L-131,89 L-136,79 L-139,71 L-141,60 L-143,49 L-141,38 L-140,27 L-138,17 L-135,8 L-132,-1 L-131,-11 L-132,-22 L-130,-33 L-129,-44 L-126,-55 L-123,-67 L-121,-76 L-121,-85 Z"
            fill="rgb(255,209,181)"
            stroke="rgb(171,128,56)"
            strokeWidth="2"
          />

          {/* 肚子 */}
          <path
            d="M-95,127 L-97,135 L-96,142 L-104,147 L-109,152 L-112,156 L-116,165 L-119,173 L-121,182 L-120,188 L-117,198 L-114,208 L-118,211 L-122,218 L-123,228 L-122,238 L-109,261 L-103,266 L-103,275 L-97,281 L-91,289 L-83,292 L-74,297 L-64,299 L-55,298 L-46,295 L-40,301 L-35,306 L-27,310 L-16,312 L-8,311 L2,307 L6,303 L13,300 L20,304 L26,309 L34,314 L45,315 L55,314 L62,310 L70,305 L77,296 L89,295 L96,291 L103,286 L111,277 L113,269 L116,258 L116,251 L113,242 L119,238 L122,231 L125,221 L125,208 L123,197 L116,187 L116,177 L117,168 L117,163 L111,162 L102,163 L95,157 L93,149 L87,150 L78,150 L72,154 L60,154 L56,156 L54,165 L56,175 L54,184 L56,196 L53,211 L55,223 L54,231 L51,239 L44,243 L37,245 L34,246 L20,246 L5,246 L-33,241 L-56,237 L-80,233 L-90,230 L-94,227 L-96,219 L-98,210 L-95,201 L-95,194 L-91,181 L-88,163 L-82,147 L-77,134 L-86,131 Z"
            fill="rgb(255,255,255)"
            stroke="rgb(171,128,56)"
            strokeWidth="2"
          />

          {/* 衣服 */}
          <path
            d="M56,156 L54,165 L56,175 L54,184 L56,196 L53,211 L55,223 L54,231 L51,239 L44,243 L37,245 L34,246 L20,246 L5,246 L-33,241 L-56,237 L-80,233 L-90,230 L-94,227 L-96,219 L-98,210 L-95,201 L-95,194 L-91,181 L-88,163 L-82,147 L-77,134 L-71,138 L-61,141 L-51,145 L-40,147 L-31,150 L-20,152 L-9,155 L1,156 L12,157 L22,157 L34,158 L46,156 Z"
            fill="rgb(247,206,79)"
            stroke="rgb(171,128,56)"
            strokeWidth="2"
          />
          <path
            d="M-96,212 L52,227 L52,234 L-95,220 Z"
            fill="rgb(255,255,255)"
            stroke="rgb(255,255,255)"
            strokeWidth="0.3"
          />
          <path d="M-91,228 L45,240" stroke="rgb(255,255,255)" strokeWidth="2" />

          {/* 左胳膊 */}
          <path
            d="M93,147 L97,143 L102,138 L111,134 L119,131 L130,128 L143,126 L149,120 L158,117 L166,113 L175,110 L177,103 L182,95 L191,89 L199,87 L204,85 L210,86 L214,88 L217,93 L221,96 L224,100 L224,104 L223,108 L225,112 L226,118 L224,124 L219,128 L215,129 L210,127 L205,123 L208,118 L203,114 L203,110 L209,109 L213,105 L214,130 L206,135 L202,137 L197,135 L192,132 L187,129 L186,132 L180,136 L170,140 L162,144 L151,149 L139,155 L128,159 L118,161 L110,162 L104,163 L99,160 L94,156 L93,150 L95,147 Z"
            fill="rgb(255,209,181)"
            stroke="rgb(171,128,56)"
            strokeWidth="2"
          />

          {/* 右胳膊 */}
          <path
            d="M-126,98 L-133,94 L-141,90 L-146,88 L-151,85 L-154,78 L-157,72 L-162,68 L-168,64 L-179,61 L-184,59 L-189,61 L-192,64 L-196,69 L-199,73 L-201,78 L-199,85 L-201,93 L-200,98 L-196,102 L-190,102 L-188,106 L-184,108 L-179,110 L-171,108 L-163,103 L-165,106 L-157,111 L-149,116 L-140,120 L-131,125 L-118,133 L-110,136 L-99,139 L-97,136 L-97,133 L-95,126 L-98,123 L-104,118 L-111,112 L-119,103 Z"
            fill="rgb(255,209,181)"
            stroke="rgb(171,128,56)"
            strokeWidth="2"
          />

          {/* 头部云朵轮廓 - 左 */}
          <path
            d="M-139,80 L-147,76 L-151,73 L-156,68 L-158,64 L-161,59 L-164,53 L-164,49 L-165,41 L-165,36 L-169,30 L-172,27 L-176,17 L-177,12 L-178,5 L-179,1 L-179,-7 L-177,-16 L-175,-25 L-174,-29 L-177,-34 L-179,-41 L-181,-47 L-182,-51 L-183,-59 L-183,-64 L-181,-76 L-180,-81 L-178,-88 L-174,-94 L-169,-100 L-167,-106 L-167,-114 L-167,-123 L-165,-131 L-162,-139 L-161,-144 L-154,-151 L-150,-156 L-147,-160 L-141,-164 L-135,-168 L-132,-170 L-130,-178 L-125,-189 L-122,-195 L-117,-200 L-114,-203 L-103,-212 L-95,-215 L-81,-218 L-72,-218 L-67,-223 L-63,-226 L-55,-234 L-51,-238 L-43,-243 L-36,-246 L-27,-248"
            fill="none"
            stroke="rgb(171,128,56)"
            strokeWidth="2"
          />

          {/* 头部云朵轮廓 - 右 */}
          <path
            d="M223,111 L235,106 L242,102 L249,94 L254,91 L258,85 L263,80 L265,75 L267,69 L268,65 L269,57 L272,50 L271,42 L269,36 L275,30 L279,23 L283,15 L286,8 L289,-3 L286,-13 L286,-27 L284,-36 L279,-44 L279,-54 L279,-60 L282,-68 L282,-77 L280,-85 L280,-93 L277,-103 L271,-112 L264,-118 L224,-179 L216,-183 L207,-187 L200,-189 L199,-195 L195,-202 L192,-207 L187,-213 L182,-217 L171,-224 L165,-233 L160,-240 L152,-242 L153,-247 L152,-256 L148,-264 L140,-271 L131,-274 L123,-278 L123,-283 L120,-293 L115,-300 L109,-307 L103,-311 L100,-314 L92,-318 L90,-312 L83,-306 L76,-302 L67,-299 L59,-297 L50,-293 L50,-291 L43,-287 L37,-288 L29,-288 L22,-284 L13,-283 L5,-276 L-1,-270 L-9,-267 L-15,-265 L-20,-261 L-22,-254 L-27,-248 L-36,-246"
            fill="none"
            stroke="rgb(171,128,56)"
            strokeWidth="2"
          />

          {/* 羊角 */}
          <path
            d="M194,-169 L201,-165 L209,-171 L216,-176 L224,-181 L231,-184 L244,-188 L258,-192 L271,-194 L281,-194 L288,-192 L296,-191 L301,-189 L306,-188 L311,-185 L316,-182 L318,-177 L319,-172 L317,-168 L313,-163 L311,-160 L310,-158 L306,-153 L300,-151 L293,-148 L291,-145 L285,-141 L281,-139 L278,-136 L275,-132 L272,-127 L268,-123 L265,-118 L257,-113 L251,-105 L254,-102 L257,-96 L254,-102 L251,-106 L245,-109 L238,-105 L237,-110 L236,-118 L233,-124 L229,-129 L225,-131 L219,-132 L216,-132 L215,-135 L215,-139 L216,-148 L215,-150 L214,-154 L209,-160 L205,-162 Z"
            fill="rgb(130,94,71)"
            stroke="rgb(171,128,56)"
            strokeWidth="2"
          />
          <path
            d="M-119,-201 L-122,-205 L-124,-211 L-128,-216 L-135,-223 L-139,-232 L-140,-240 L-141,-249 L-137,-254 L-129,-256 L-119,-257 L-110,-256 L-98,-253 L-90,-250 L-81,-246 L-74,-242 L-66,-237 L-59,-230 L-62,-225 L-71,-217 L-82,-217 L-94,-215 L-104,-211 L-111,-204 Z"
            fill="rgb(130,94,71)"
            stroke="rgb(171,128,56)"
            strokeWidth="2"
          />

          {/* 耳朵 */}
          <path
            d="M229,-68 L233,-70 L242,-70 L250,-69 L257,-65 L263,-58 L269,-51 L274,-44 L278,-38 L282,-31 L288,-25 L294,-20 L296,-19 L293,-16 L285,-12 L281,-9 L274,-7 L267,-6 L262,-6 L252,-6 L241,-9 L234,-12 L228,-18 L221,-29 L217,-40 L218,-52 L220,-60 L225,-64 Z"
            fill="rgb(255,209,184)"
            stroke="rgb(171,128,56)"
            strokeWidth="2"
          />
          <path
            d="M-165,-112 L-174,-109 L-179,-106 L-187,-103 L-188,-101 L-185,-97 L-182,-91 L-178,-88 L-176,-90 L-174,-92 L-167,-99 L-165,-102 L-165,-108 Z"
            fill="rgb(255,209,184)"
            stroke="rgb(171,128,56)"
            strokeWidth="2"
          />

          {/* 眼睛 - 右 */}
          <circle cx="-71" cy="-38" r="30" fill="rgb(255,255,255)" stroke="rgb(171,128,56)" strokeWidth="2" />
          <motion.g
            animate={{
              x: companion.eyeOffset?.x || 0,
              y: companion.eyeOffset?.y || 0,
              scaleY: companion.isBlinking ? 0.1 : 1,
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <circle cx="-71" cy="-37" r="12" fill="rgb(26,26,26)" />
          </motion.g>
          <circle cx="-74" cy="-41" r="4.5" fill="rgb(255,255,255)" />

          {/* 眼睛 - 左 */}
          <circle cx="36" cy="-18" r="30" fill="rgb(255,255,255)" stroke="rgb(171,128,56)" strokeWidth="2" />
          <motion.g
            animate={{
              x: companion.eyeOffset?.x || 0,
              y: companion.eyeOffset?.y || 0,
              scaleY: companion.isBlinking ? 0.1 : 1,
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <circle cx="39" cy="-18" r="12" fill="rgb(26,26,26)" />
          </motion.g>
          <circle cx="34" cy="-22" r="4.5" fill="rgb(255,255,255)" />

          {/* 眉毛 */}
          <path
            d="M-82,-89 L-78,-92 L-74,-95 L-67,-97 L-60,-97 L-54,-95 L-48,-93 L-45,-91 L-41,-89 L-38,-86 L-35,-83"
            fill="none"
            stroke="rgb(171,128,56)"
            strokeWidth="2"
          />
          <path
            d="M22,-74 L26,-77 L31,-80 L40,-82 L48,-82 L55,-80 L63,-78 L70,-74 L75,-70 L79,-65"
            fill="none"
            stroke="rgb(171,128,56)"
            strokeWidth="2"
          />

          {/* 鼻子 */}
          <path
            d="M-39,-2 L-46,-0 L-52,2 L-55,6 L-56,10 L-56,14 L-55,17 L-52,20 L-48,23 L-44,25 L-40,26 L-35,27 L-30,28 L-24,27 L-21,26 L-17,23 L-15,21 L-14,17 L-14,12 L-15,9 L-20,4 L-22,3 L-26,1 L-30,-0 L-33,-1 Z"
            fill="rgb(51,36,28)"
            stroke="rgb(51,36,28)"
            strokeWidth="2"
          />
          <circle cx="-22" cy="12" r="2.5" fill="rgb(255,255,255)" />

          {/* 嘴巴 */}
          <motion.path
            d="M-71,44 L-69,48 L-63,53 L-64,56 L-66,66 L-65,78 L-65,87 L-62,92 L-59,99 L-56,103 L-50,106 L-47,109 L-39,111 L-29,111 L-23,110 L-18,108 L-13,105 L-10,102 L-6,97 L-1,90 L2,83 L5,75 L6,69 L6,60 L11,65 L7,61 L5,58 L3,53 L5,58 L2,58 L-5,60 L-9,60 L-14,62 L-20,62 L-25,60 L-34,60 L-43,59 L-52,57 L-58,55 L-62,54 L-67,49 Z"
            fill="rgb(227,122,110)"
            stroke="rgb(171,128,56)"
            strokeWidth="2"
            variants={mouthVariants}
            animate={companion.clickCount > 0 ? 'excited' : 'normal'}
          />
          <path
            d="M-62,54 L-60,55 L-57,55 L-54,57 L-49,58 L-47,60 L-50,61 L-55,63 L-59,67 L-64,72 L-65,75 L-66,69 L-65,60 Z"
            fill="rgb(161,61,64)"
            stroke="none"
          />

          {/* 羊腿 */}
          <path
            d="M-107,234 L-106,237 L-110,239 L-114,238 L-120,238 L-123,237 L-128,239 L-134,240 L-142,245 L-142,235 L-144,231 L-147,224 L-148,220 L-151,215 L-157,209 L-164,204 L-171,204 L-177,204 L-183,205 L-188,206 L-191,209 L-195,215 L-198,219 L-199,224 L-199,231 L-199,237 L-198,244 L-198,249 L-195,257 L-193,262 L-190,267 L-186,274 L-181,281 L-176,284 L-172,285 L-163,286 L-157,282 L-152,278 L-149,273 L-146,268 L-139,264 L-129,261 L-123,261 L-111,259 L-101,260 L-98,265 L-98,260 L-101,258 L-101,255 L-102,254 L-103,249 L-100,245 L-104,241 Z"
            fill="rgb(255,209,181)"
            stroke="rgb(171,128,56)"
            strokeWidth="2"
          />
          <path
            d="M-188,224 L-187,219 L-186,215 L-185,212 L-182,206"
            fill="none"
            stroke="rgb(171,128,56)"
            strokeWidth="2"
          />
          <path
            d="M-142,244 L-142,249 L-143,256 L-144,262 L-145,267"
            fill="none"
            stroke="rgb(171,128,56)"
            strokeWidth="2"
          />
          <path
            d="M115,264 L123,266 L130,268 L135,262 L142,256 L151,255 L160,255 L165,259 L170,263 L175,270 L177,280 L180,289 L181,295 L180,301 L179,309 L175,315 L168,320 L162,323 L155,323 L147,323 L139,319 L135,311 L130,304 L129,296 L128,287 L132,287 L123,287 L115,285 L107,284 Z"
            fill="rgb(255,209,181)"
            stroke="rgb(171,128,56)"
            strokeWidth="2"
          />
          <path d="M153,302 L154,309 L155,315 L158,320 L159,323" fill="none" stroke="rgb(171,128,56)" strokeWidth="2" />

          {/* 头部纹理线条 */}
          <path
            d="M-27,-248 L-24,-242 L-21,-237 L-18,-232 L-13,-229 L-9,-227 L-2,-224"
            fill="none"
            stroke="rgb(171,128,56)"
            strokeWidth="2"
          />
          <path
            d="M1,-269 L6,-265 L11,-258 L16,-253 L24,-249 L30,-248 L37,-245 L47,-245"
            fill="none"
            stroke="rgb(171,128,56)"
            strokeWidth="2"
          />
          <path d="M45,-286 L46,-280 L48,-275 L53,-271 L62,-267" fill="none" stroke="rgb(171,128,56)" strokeWidth="2" />
          <path
            d="M123,-276 L121,-273 L115,-270 L112,-268 L105,-266 L98,-266"
            fill="none"
            stroke="rgb(171,128,56)"
            strokeWidth="2"
          />
          <path
            d="M152,-244 L146,-239 L138,-235 L128,-236 L117,-236 L104,-237"
            fill="none"
            stroke="rgb(171,128,56)"
            strokeWidth="2"
          />
          <path
            d="M168,-223 L168,-217 L163,-210 L159,-205 L154,-203 L143,-202 L137,-201 L131,-201"
            fill="none"
            stroke="rgb(171,128,56)"
            strokeWidth="2"
          />
        </SheepSVG>

        {/* 粒子效果 */}
        <ParticlesContainer>
          {companion.particles.map((particle) => (
            <StarParticle
              key={particle.id}
              initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
              animate={{
                x: particle.x,
                y: particle.y,
                opacity: 0,
                scale: 1.5,
                rotate: 360,
              }}
              transition={{ duration: 1, ease: 'easeOut' }}
              style={{
                left: '50%',
                top: '50%',
              }}
            >
              {particle.emoji}
            </StarParticle>
          ))}
        </ParticlesContainer>
      </SheepContainer>
    </>
  );
};

export default SheepWidget;
