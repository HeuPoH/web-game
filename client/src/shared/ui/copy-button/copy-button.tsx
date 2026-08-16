import React from 'react';
import CheckOutlined from '@ant-design/icons/CheckOutlined';
import CopyOutlined from '@ant-design/icons/CopyOutlined';

import { cn, copyToClipboard } from '../../utils';

import classes from './style.module.css';

export const CopyButton: React.FC<{ text: string; className?: string }> = ({ text, className }) => {
  const [copied, setCopied] = React.useState(false);
  const onCopy = async () => {
    setCopied(true);
    await copyToClipboard(text);
    setTimeout(() => setCopied(false), 3000);
  };

  if (copied) {
    return <CheckOutlined className={className} />;
  }

  return (
    <CopyOutlined
      className={cn(classes.copyIcon, className)}
      onClick={onCopy}
    />
  );
};
