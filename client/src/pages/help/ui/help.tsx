import React from 'react';
import { Tabs, Button } from 'antd';
import { HomeOutlined } from '@ant-design/icons';

import { ActionsDesc } from './actions-desc';
import { customHistory } from '../../../shared/lib';
import { PageContainer } from '../../../shared/ui';

import classes from './help.module.css';

export const Help: React.FC = () => {
  const goHome = () => customHistory.push('/');

  const tabItems = [
    {
      key: 'about',
      label: 'Об игре',
      children: (
        <div className={classes.tabContent}>
          <p className={classes.text}>
            <strong>«Пузатый замес»</strong> — это пошаговая гонка, в которой
            побеждает не самый быстрый, а самый пузатый и коварный! Ты
            управляешь персонажем, который вместе с другими игроками пытается
            первым добраться до выхода из лабиринта. Главная фишка —{' '}
            <strong>очередь команд</strong>. Ты заранее планируешь свои шаги, а
            потом все игроки одновременно выполняют по одной команде раз в
            секунду.
          </p>
        </div>
      ),
    },
    {
      key: 'labyrinth',
      label: 'Лабиринт',
      children: (
        <div className={classes.tabContent}>
          <p className={classes.text}>
            Каждая игра проходит на случайно сгенерированном лабиринте. Стены
            расставлены так, что всегда есть хотя бы один путь к финишу, но
            часто — несколько. На карте могут появляться{' '}
            <strong>временные стены</strong> (построенные игроками) и{' '}
            <strong>ямы</strong> (ловушки). Если ты упадёшь в яму — вернёшься
            на старт. Будь внимателен: туман скрывает дальние клетки, и ты
            видишь только то, что рядом с твоим персонажем.
          </p>
        </div>
      ),
    },
    {
      key: 'howto',
      label: 'Как играть',
      children: (
        <div className={classes.tabContent}>
          <h3 className={classes.subheading}>Очередь команд</h3>
          <ol className={classes.list}>
            <li>
              <strong>Планирование.</strong> Ты добавляешь команды (шаг
              вверх/вниз/влево/вправо) в свою личную очередь. Можно добавить
              до 5 команд. Очередь показывается на экране, и ты можешь удалить
              любую команду в любой момент.
            </li>
            <li>
              <strong>Выполнение.</strong> Раз в секунду (игровой такт) происходит следующее:
              <ul className={classes.sublist}>
                <li>Сначала срабатывают все <strong>мгновенные скиллы</strong>, активированные в течение такта (толчки, заморозка, бросок и т.п.). Они могут изменить позиции персонажей, наложить эффекты или заблокировать команды.</li>
                <li>Затем каждый игрок выполняет <strong>первую команду</strong> из своей очереди. Все движутся одновременно.</li>
                <li>После этого проверяются столкновения, срабатывают ловушки (ямы) и применяются эффекты.</li>
              </ul>
            </li>
            <li>
              <strong>Скиллы.</strong> У каждого игрока есть дван случайных
              особых навыка. Они так же добавляются в очередь и имеют перезарядку.
            </li>
            <li>
              <strong>Саботаж.</strong> Ты можешь толкать соперников, ставить
              стены, притягивать, замораживать — всё, чтобы сломать чужие
              планы. Но помни: другие могут сделать то же самое с тобой.
            </li>
          </ol>
          <p className={classes.text}>
            Главное правило:{' '}
            <strong>
              думай на шаг вперёд, потому что твой план могут сломать в любой
              момент.
            </strong>
          </p>
        </div>
      ),
    },
    {
      key: 'skills',
      label: 'Умения',
      children: (
        <div className={classes.tabContent}>
          <ActionsDesc />
        </div>
      ),
    },
  ];

  return (
    <PageContainer style={{ height: '100vh' }}>
      <div className={classes.container}>
        <div className={classes.header}>
          <h2 className={classes.title}>Помощь</h2>
          <Button icon={<HomeOutlined />} onClick={goHome} type='default' />
        </div>
        <Tabs
          defaultActiveKey='about'
          centered
          className={classes.tabs}
          items={tabItems}
          classNames={{ content: classes.tabsContent, body: classes.tabsContent }}
        />
      </div>
    </PageContainer>
  );
};
