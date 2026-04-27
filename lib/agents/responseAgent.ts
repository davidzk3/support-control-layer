export function responseAgent(category: string) {
  if (category === "trading_platform_issue") {
    return `Thanks for flagging this. I understand how frustrating it is when you are trying to manage an active position and the trading flow does not behave as expected.

To review this properly, please send the market link, approximate timestamp, account email or wallet, the side you were trying to trade, and any screenshot or error message you saw.

I cannot promise a specific outcome from support, but I will route this for review with the details needed to investigate the failed action.`;
  }

  if (category === "market_resolution") {
    return `Thanks for raising this. A market ending in the real world does not always mean it is immediately settled on the platform, especially when resolution or settlement steps are still being processed.

Please share the market link and the specific resolution concern. I will escalate this for review against the market criteria and the relevant resolution state.`;
  }

  if (category === "deposit_issue") {
    return `Thanks for reaching out. Please send the transaction hash, wallet address, token sent, network used, and the account login type.

Recovery depends on the token, network, wallet type, and destination address, so I do not want to overpromise before the transaction path is reviewed.`;
  }

  if (category === "account_issue") {
    return `Thanks for reaching out. I understand account restrictions can be frustrating.

Please share your account email or wallet address and any recent activity context you think is relevant. I cannot discuss internal review logic, but I can make sure the account is routed for the appropriate review.`;
  }

  if (category === "geo_issue") {
    return `Thanks for checking. I cannot advise on using VPNs or bypassing access restrictions.

If you are having trouble accessing your account while traveling, please share your account identifier and the error message you are seeing. We can review the access issue and provide guidance that is consistent with platform policy.`;
  }

  return `Thanks for reaching out. Please share your account identifier, relevant links, screenshots, and a short description of what happened so the issue can be reviewed accurately.`;
}