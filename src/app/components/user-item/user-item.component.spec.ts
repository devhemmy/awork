import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserItemComponent } from './user-item.component';
import { User } from '../../models/user.model';
import { MockResult } from '../../mock-data';
import { UserResult } from '../../models/api-result.model';

describe('UserItemComponent', () => {
  let component: UserItemComponent;
  let fixture: ComponentFixture<UserItemComponent>;

  // Helper to create User from UserResult
  const createMockUser = (result: UserResult, natCount: number): User => ({
    firstname: result.name.first,
    lastname: result.name.last,
    email: result.email,
    phone: result.phone,
    nat: result.nat,
    natCount: natCount,
    imageSrc: result.picture.medium,
    fullData: result,
  });

  const mockUserResult = MockResult.results[0] as UserResult;
  const mockUser = createMockUser(mockUserResult, 5);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserItemComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(UserItemComponent);
    fixture.componentRef.setInput('user', mockUser);

    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should start collapsed', () => {
    expect(component.isExpanded()).toBeFalse();
  });

  it('should toggle expanded state', () => {
    expect(component.isExpanded()).toBeFalse();
    component.toggle();
    expect(component.isExpanded()).toBeTrue();
    component.toggle();
    expect(component.isExpanded()).toBeFalse();
  });

  it('should have user data from input', () => {
    expect(component.user().firstname).toBe(mockUserResult.name.first);
    expect(component.user().lastname).toBe(mockUserResult.name.last);
    expect(component.user().natCount).toBe(5);
  });
});
