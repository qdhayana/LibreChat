import { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import { Checkbox, OGDialog, OGDialogContent, OGDialogTitle, Button } from '@librechat/client';
import { useLocalize } from '~/hooks';
import store from '~/store';

const SEEN_KEY = 'rekanaiPopupSeen';
const REKANAI_DOWNLOAD_URL = 'https://central.ayana.id/download-rekanai/';

/** Session storage can throw (private mode, blocked site data); treat that as "not seen". */
const hasSeenThisSession = (): boolean => {
  try {
    return sessionStorage.getItem(SEEN_KEY) != null;
  } catch {
    return false;
  }
};

const markSeen = (): void => {
  try {
    sessionStorage.setItem(SEEN_KEY, 'true');
  } catch {
    return;
  }
};

/** RekanAI promo shown once per browser session, unless the user opted out for good. */
function Popup() {
  const localize = useLocalize();
  const [hidden, setHidden] = useRecoilState(store.hideRekanAIPopup);
  const [open, setOpen] = useState(() => !hasSeenThisSession());
  const [dontShowAgain, setDontShowAgain] = useState(false);

  useEffect(markSeen, []);

  const close = () => {
    if (dontShowAgain) {
      setHidden(true);
    }
    setOpen(false);
  };

  return (
    <OGDialog open={open && !hidden} onOpenChange={(isOpen) => !isOpen && close()}>
      <OGDialogContent aria-describedby={undefined} className="w-11/12 max-w-3xl">
        <OGDialogTitle className="sr-only">{localize('com_ui_rekanai_title')}</OGDialogTitle>
        <a href={REKANAI_DOWNLOAD_URL} target="_blank" rel="noopener noreferrer">
          <img
            src="/assets/rekanai-splash.jpg"
            alt={localize('com_ui_rekanai_alt')}
            className="block w-full rounded-xl"
          />
        </a>
        <div className="flex items-center justify-between gap-4">
          <label className="text-text-secondary flex cursor-pointer items-center gap-2 text-sm">
            <Checkbox
              checked={dontShowAgain}
              onCheckedChange={(checked) => setDontShowAgain(checked === true)}
              aria-label={localize('com_ui_dont_show_again')}
            />
            {localize('com_ui_dont_show_again')}
          </label>
          <Button variant="outline" onClick={close}>
            {localize('com_ui_close')}
          </Button>
        </div>
      </OGDialogContent>
    </OGDialog>
  );
}

export default Popup;
