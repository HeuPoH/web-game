import { App, ConfigProvider } from 'antd';

export function ThemeProvider(props: React.PropsWithChildren) {
  return (
    <ConfigProvider
      theme={{
        cssVar: { key: 'app' },
        token: {
          colorText: '#e2e2e2',
          purple: '#a855f7',
          pink: '#ec4899',
          fontSize: 16,
          fontSizeLG: 18
        },
        components: {
          Form: {
            labelColor: 'var(--ant-color-white)',
          },
          Radio: {
            buttonBg: 'rgba(51, 65, 85, 0.5)',
            colorBorderBg: '#475569',
            colorBorder: '#475569',
            buttonSolidCheckedBg: 'var(--ant-purple)',
            colorBgTextHover: '#e2e2e2',
            colorPrimary: '#e2e2e2',
            buttonSolidCheckedActiveBg: 'var(--ant-purple)',
            buttonSolidCheckedHoverBg: 'var(--ant-purple)',
          },
          Input: {
            paddingBlock: 8,
            paddingInline: 10,
            boxShadow: 'none',
            activeShadow: 'none',
            activeBorderColor: 'var(--ant-purple)',
            hoverBorderColor: '#475569',
            colorBgContainer: 'rgba(51, 65, 85, 0.5)',
            borderRadius: 12,
            colorBorder: '#475569',
            colorTextPlaceholder: '#94a3b8',
            colorText: 'var(--ant-color-white)'
          },
          Card: {
            colorTextDescription: '#6b7280',
            colorBgContainer: 'rgba(51, 65, 85, 0.5)',
            colorBorder: '#475569',
            colorBorderSecondary: '#475569',
            fontSize: 14,
            fontSizeLG: 16
          },
          Button: {
            primaryShadow: 'none',
            defaultBg: '#414751',
            defaultBorderColor: '#475569',
            defaultHoverBg: '#414751bd',
            defaultHoverColor: 'var(--ant-color-white)',
            defaultHoverBorderColor: '#475569',
          },
          Modal: {
            contentBg: '#1e293b',
            borderRadiusLG: 10,
            colorIcon: 'var(--ant-color-white)',
            colorIconHover: '#777777',
            contentPadding: 15
          } as never,
          Tabs: {
            colorBorderSecondary: '#374151',
            colorBgContainer: '#1e293b',
            colorText: '#B0B3BA',
            itemSelectedColor: 'var(--ant-color-white)',
            itemHoverColor: 'var(--ant-color-white)',
            margin: 5
          }
        },
      }}
    >
      <App>
        {props.children}
      </App>
    </ConfigProvider>
  );
}
