import React from 'react';

type SocialButtonProps = {
  id: string;
  enabled: boolean;
  serverDomain: string;
  oauthPath: string;
  label: string;
  /** Accepted for compatibility with the callers; AYANA's button shows no icon. */
  Icon?: React.ComponentType;
};

const SocialButton = ({ id, enabled, serverDomain, oauthPath, label }: SocialButtonProps) => {
  if (!enabled) {
    return null;
  }

  return (
    <div className="mt-2 flex gap-x-2">
      <a
        aria-label={`${label}`}
        className="bg-surface-submit text-text-on-status hover:bg-surface-submit-hover focus-visible:ring-ring-primary flex h-12 w-full items-center justify-center rounded-2xl px-5 font-medium shadow-sm transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
        href={`${serverDomain}/oauth/${oauthPath}`}
        data-testid={id}
      >
        <p>{label}</p>
      </a>
    </div>
  );
};

export default SocialButton;
