import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserListComponent } from './user-list.component';
import { UsersService } from '../../services/users.service';
import { UsersServiceStub } from '../../services/users.service.stub';
import { User, UserGroup } from '../../models/user.model';
import { MockResult } from '../../mock-data';
import { UserResult } from '../../models/api-result.model';

describe('UserListComponent', () => {
  let component: UserListComponent;
  let fixture: ComponentFixture<UserListComponent>;

  // Helper to create User from UserResult
  const createMockUser = (result: UserResult): User => ({
    firstname: result.name.first,
    lastname: result.name.last,
    email: result.email,
    phone: result.phone,
    nat: result.nat,
    natCount: 1,
    imageSrc: result.picture.medium,
    fullData: result,
  });

  const mockUsers = (MockResult.results as UserResult[]).map(createMockUser);
  const mockUserGroups: UserGroup[] = [
    { title: 'Test Group', users: mockUsers }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserListComponent],
      providers: [
        {
          provide: UsersService,
          useClass: UsersServiceStub
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UserListComponent);
    fixture.componentRef.setInput('userGroups', mockUserGroups);

    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should flatten user groups into virtual items', () => {
    expect(component.virtualItems.length).toBeGreaterThan(0);
    expect(component.virtualItems[0].type).toBe('header');
  });
});
