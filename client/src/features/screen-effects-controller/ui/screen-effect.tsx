import { cn } from '../../../shared/utils';
import classes from './style.module.css';

export const ScreenEffect: React.FC<{ ref: React.Ref<HTMLDivElement> }> = ({ ref }) => {
  return <div ref={ref} className={cn(classes.effectContainer, classes.jumpEffect)} />;
};
