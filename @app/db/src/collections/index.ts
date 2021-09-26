import * as accountService from './account.service';
export { AccountService } from './account.service';
import * as tokenService from './token.service';
export { TokenService } from './token.service';

//new
// import * as rescuerService from "./rescuer.service"
// export { RescuerService } from './rescuer.service';
import * as commandsService from "./commands.service"
export { CommandsService } from './commands.service';
import * as settingsService from "./settings.service"
export { SettingsService } from './settings.service';
import * as sensorService from "./sensor.service"
export { SensorService } from './sensor.service';
import * as locationService from "./location.service"
export { LocationService } from './location.service';
import * as alarmsService from "./alarms.service"
export { AlarmsService } from './alarms.service';

export const collectionProviders = [
    accountService,
    tokenService,
    // rescuerService
    commandsService,
    settingsService,
    sensorService,
    locationService,
    alarmsService
].map(service => service.collectionProvider)

export const collectionServices = [
    accountService.AccountService,
    tokenService.TokenService,
    // rescuerService.RescuerService
    commandsService.CommandsService,
    settingsService.SettingsService,
    sensorService.SensorService,
    locationService.LocationService,
    alarmsService.AlarmsService
];