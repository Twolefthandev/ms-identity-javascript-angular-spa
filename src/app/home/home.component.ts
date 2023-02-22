import { Component, OnInit } from '@angular/core';
import { MsalBroadcastService, MsalService } from '@azure/msal-angular';
import { SecretClient } from '@azure/keyvault-secrets';
import { InteractiveBrowserCredential } from '@azure/identity';
import {
  EventMessage,
  EventType,
  AuthenticationResult,
} from '@azure/msal-browser';
import { filter } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  loginDisplay = false;
  appversion = '';
  client: SecretClient;
  secretName: string;
  envVariable: string;
  secretValue = '';

  constructor(
    private authService: MsalService,
    private msalBroadcastService: MsalBroadcastService
  ) {
    this.appversion = environment.appversion;
    const keyVaultName = environment.keyvaultname;
    var credential = new InteractiveBrowserCredential({
      tenantId: 'fe85910f-e6e0-43da-a1ec-9e4e94a9f6c4',
      clientId: '25b87be3-3584-43de-9049-33139895fc5a',
      redirectUri: 'https://victorious-meadow-0bb785603.1.azurestaticapps.net',
    });

    const url = `https://${keyVaultName}.vault.azure.net`;
    this.client = new SecretClient(url, credential);
    this.secretName = environment.secretname;
    this.envVariable = environment.appversion;
  }

  ngOnInit(): void {
    this.msalBroadcastService.msalSubject$
      .pipe(
        filter((msg: EventMessage) => msg.eventType === EventType.LOGIN_SUCCESS)
      )
      .subscribe((result: EventMessage) => {
        console.log(result);
        const payload = result.payload as AuthenticationResult;
        this.authService.instance.setActiveAccount(payload.account);
      });

    async () => {
      // Read the secret we created
      var secret = await this.client.getSecret(this.secretName);
      this.secretValue = secret.value ? secret.value : '';
    };

    this.setLoginDisplay();
  }

  setLoginDisplay() {
    this.loginDisplay = this.authService.instance.getAllAccounts().length > 0;
  }
}
