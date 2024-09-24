import { TestBed } from '@angular/core/testing';

import { IpcServiceService } from './ipc-service.service';

describe('IpcServiceService', () => {
  let service: IpcServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IpcServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
