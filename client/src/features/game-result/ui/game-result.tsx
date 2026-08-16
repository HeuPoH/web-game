import type React from 'react';
import { Clock, LogOut, Star, Trophy, Users } from 'lucide-react';
import type { Winner } from '@game/shared-types';

import { defer } from '../../../shared/utils';
import { Modal, PinkGradientButton, PlayerAvatarDumb } from '../../../shared/ui';
import { customHistory } from '../../../shared/lib';

import classes from './game-result.module.css';

type Result = {
  ticks: number;
  winners: Winner[];
}

export function openGameResult(result: Result) {
  return defer<void>((res, container) => {
    return (
      <Modal
        getContainer={container}
        footer={null}
        closable={false}
      >
        <GameResult onClose={res} result={result} />
      </Modal>
    );
  });
}

type GameResultProps = {
  result: Result;
  onClose(): void;
};

const GameResult: React.FC<GameResultProps> = ({ result, onClose }) => {
  return (
    <>
      <div className={classes.header}>
        <div className={classes.trophyIcon}>
          <Trophy size={36} color='white' />
        </div>
        <div className={classes.finishLabel}>Финиш!</div>
        <div className={classes.stars}>
          {[1, 2, 3].map((i) => (
            <Star
              key={i}
              size={32}
              fill='#f59e0b'
              stroke='#f59e0b'
              className={classes.starFilled}
            />
          ))}
        </div>
      </div>
      <div className={classes.stats}>
        <div className={classes.statItem}>
          <Clock size={18} stroke='#60a5fa' />
          <div className={classes.statValue}>{`${result.ticks} сек`}</div>
          <div className={classes.statLabel}>Время</div>
        </div>
        <div className={classes.statItem}>
          <Users size={18} stroke='#10b981' />
          <div className={classes.statValue}>{result.winners.length}</div>
          <div className={classes.statLabel}>Победителей</div>
        </div>
      </div>
      <div className={classes.ratingSection}>
        <div className={classes.ratingTitle}>Список победителей</div>
        {result.winners.map((player, idx) => {
          return (
            <div key={player.userId} className={classes.ratingRow}>
              <span>
                #{idx + 1}
              </span>
              <PlayerAvatarDumb className={classes.avatar} nickname={player.login} />
              <span className={classes.playerName}>{player.login}</span>
            </div>
          );
        })}
      </div>
      <div>
        <PinkGradientButton
          type='primary'
          size='large'
          block
          onClick={() => {
            onClose();
            customHistory.push('/');
          }}
          icon={<LogOut size={15} />}
        >
          В главное меню
        </PinkGradientButton>
      </div>
    </>
  );
};
