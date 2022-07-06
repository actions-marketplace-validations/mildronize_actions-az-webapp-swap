import * as core from '@actions/core';
import { ISwapAppService, IAppSetting } from '../interfaces';
import crypto from 'crypto';
import { findAppSettingName } from '../utils/swapAppSettingsUtility';
import { AppSettingsType } from './AppSettingsBase';

export function hashValue(value: string) {
  const sha256Hasher = crypto.createHmac('sha3-512', process.env.HASH_SECRET || '');
  return sha256Hasher.update(value).digest('base64');
}

export default class AppSettingsMasking {
  constructor(private swapAppService: ISwapAppService, private type: AppSettingsType) {}

  public mask(appSettings: IAppSetting[], slot?: string) {
    const { appSettings: swapAppSettings } = this.swapAppService;

    for (const swapAppSetting of swapAppSettings) {
      if (swapAppSetting.sensitive === true || this.type === AppSettingsType.ConnectionStrings) {
        const found = findAppSettingName(swapAppSetting.name, appSettings);
        if (found >= 0) {
          const foundAppSetting = appSettings[found];
          foundAppSetting.value = hashValue(foundAppSetting.value);
        } else {
          core.warning(
            `Cannot masking the app setting name "${swapAppSetting.name}" on app service "${this.swapAppService.name}/${slot}" because app setting name is not found`
          );
        }
      }
    }
    return appSettings;
  }
}
