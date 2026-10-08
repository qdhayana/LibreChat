import { I18nextProvider } from 'react-i18next';
import userEvent from '@testing-library/user-event';
import { render, screen } from 'test/layout-test-utils';
import RekanAIPopup from '~/components/RekanAI';
import i18n from '~/locales/i18n';

const HIDDEN_KEY = 'hideRekanAIPopup';

const renderPopup = () =>
  render(
    <I18nextProvider i18n={i18n}>
      <RekanAIPopup />
    </I18nextProvider>,
  );

const popup = () => screen.queryByRole('dialog');
const dontShowAgain = () => screen.getByRole('checkbox', { name: /don't show this again/i });
const closeButtons = () => screen.getAllByRole('button', { name: /close/i });

describe('RekanAIPopup', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  test('shows the RekanAI image on a first visit', () => {
    renderPopup();

    expect(popup()).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /rekanai/i })).toBeInTheDocument();
  });

  test('clicking the image opens the RekanAI download page in a new tab', () => {
    renderPopup();

    const link = screen.getByRole('link', { name: /rekanai/i });

    expect(link).toHaveAttribute('href', 'https://central.ayana.id/download-rekanai/');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'));
  });

  test('closing with the checkbox ticked remembers it across sessions', async () => {
    const user = userEvent.setup();
    const { unmount } = renderPopup();

    await user.click(dontShowAgain());
    await user.click(closeButtons()[0]);

    expect(popup()).not.toBeInTheDocument();
    expect(localStorage.getItem(HIDDEN_KEY)).toBe('true');

    unmount();
    sessionStorage.clear();
    renderPopup();

    expect(popup()).not.toBeInTheDocument();
  });

  test('closing without the checkbox does not come back within the session', async () => {
    const user = userEvent.setup();
    const { unmount } = renderPopup();

    await user.click(closeButtons()[0]);

    expect(localStorage.getItem(HIDDEN_KEY)).toBeNull();

    unmount();
    renderPopup();

    expect(popup()).not.toBeInTheDocument();
  });

  test('closing without the checkbox shows again in a new session', async () => {
    const user = userEvent.setup();
    const { unmount } = renderPopup();

    await user.click(closeButtons()[0]);
    unmount();
    sessionStorage.clear();
    renderPopup();

    expect(popup()).toBeInTheDocument();
  });

  test('a reload before closing does not show it a second time in the session', () => {
    const { unmount } = renderPopup();
    unmount();
    renderPopup();

    expect(popup()).not.toBeInTheDocument();
  });

  test('stays hidden once the user opted out', () => {
    localStorage.setItem(HIDDEN_KEY, 'true');
    renderPopup();

    expect(popup()).not.toBeInTheDocument();
  });
});
