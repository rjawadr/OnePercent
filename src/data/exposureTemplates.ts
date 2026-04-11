export interface ExposureTemplate {
  id: string;
  goal: string;
  description: string;
  icon: string;
  steps: {
    name: string;
    description: string;
    initial_suds_estimate: number;
    difficulty_value: number;
    difficulty_unit: 'minutes' | 'meters' | 'steps';
    location_hint: string;
  }[];
}

export const EXPOSURE_TEMPLATES: ExposureTemplate[] = [
  {
    id: 'tpl_local_walk',
    goal: 'Walk around the block',
    description: 'Build confidence leaving home with gradual distance increases.',
    icon: 'walk',
    steps: [
      { name: 'Step outside front door', description: 'Open the door and stand on the threshold for 2 minutes.', initial_suds_estimate: 4, difficulty_value: 2, difficulty_unit: 'minutes', location_hint: 'Your front door' },
      { name: 'Walk to end of driveway', description: 'Walk to the street edge and return.', initial_suds_estimate: 5, difficulty_value: 5, difficulty_unit: 'minutes', location_hint: 'Your driveway/building entrance' },
      { name: 'Walk 50 meters down street', description: 'Walk 50m from home and return at your own pace.', initial_suds_estimate: 6, difficulty_value: 50, difficulty_unit: 'meters', location_hint: 'Your street' },
      { name: 'Walk to nearest corner', description: 'Reach the corner and return.', initial_suds_estimate: 6, difficulty_value: 100, difficulty_unit: 'meters', location_hint: 'Nearest intersection' },
      { name: 'Full block walk', description: 'Walk around the full block without stopping.', initial_suds_estimate: 7, difficulty_value: 400, difficulty_unit: 'meters', location_hint: 'Your block' },
    ],
  },
  {
    id: 'tpl_shop',
    goal: 'Visit a local shop',
    description: 'Progress from observing a shop exterior to completing a purchase.',
    icon: 'store',
    steps: [
      { name: 'View shop from outside', description: 'Stand near the shop entrance for 3 minutes without entering.', initial_suds_estimate: 4, difficulty_value: 3, difficulty_unit: 'minutes', location_hint: 'Shop exterior' },
      { name: 'Enter and immediately leave', description: 'Step inside, count to 10, then leave calmly.', initial_suds_estimate: 6, difficulty_value: 1, difficulty_unit: 'minutes', location_hint: 'Inside shop entrance' },
      { name: 'Browse for 5 minutes', description: 'Walk through aisles without buying anything.', initial_suds_estimate: 7, difficulty_value: 5, difficulty_unit: 'minutes', location_hint: 'Shop interior' },
      { name: 'Complete a purchase', description: 'Pick one item and use the checkout.', initial_suds_estimate: 8, difficulty_value: 10, difficulty_unit: 'minutes', location_hint: 'Full shop' },
    ],
  },
  {
    id: 'tpl_transport',
    goal: 'Use public transport',
    description: 'Build confidence using buses or trains progressively.',
    icon: 'bus',
    steps: [
      { name: 'Sit at a bus stop', description: 'Sit at the stop for 5 minutes without boarding.', initial_suds_estimate: 4, difficulty_value: 5, difficulty_unit: 'minutes', location_hint: 'Nearest bus stop' },
      { name: 'Board and alight at next stop', description: 'Ride one stop and get off.', initial_suds_estimate: 7, difficulty_value: 1, difficulty_unit: 'steps', location_hint: 'Local bus route' },
      { name: 'Ride 3 stops', description: 'Travel 3 stops and return.', initial_suds_estimate: 7, difficulty_value: 3, difficulty_unit: 'steps', location_hint: 'Local bus route' },
      { name: 'Ride to a destination', description: 'Travel to a planned stop and spend 10 minutes there.', initial_suds_estimate: 8, difficulty_value: 10, difficulty_unit: 'minutes', location_hint: 'Planned destination' },
    ],
  },
  {
    id: 'tpl_park',
    goal: 'Spend time in a park or open space',
    description: 'Gradually increase time and distance from exit points in open spaces.',
    icon: 'tree',
    steps: [
      { name: 'Sit on nearest bench to entrance', description: 'Sit at the park entrance bench for 5 minutes.', initial_suds_estimate: 4, difficulty_value: 5, difficulty_unit: 'minutes', location_hint: 'Park entrance' },
      { name: 'Walk 100m into park', description: 'Walk to a point 100m from the entrance and return.', initial_suds_estimate: 5, difficulty_value: 100, difficulty_unit: 'meters', location_hint: 'Inside park' },
      { name: 'Sit in the middle of the park', description: 'Choose a spot away from exits and sit for 10 minutes.', initial_suds_estimate: 7, difficulty_value: 10, difficulty_unit: 'minutes', location_hint: 'Park centre' },
      { name: 'Full park walk without exits', description: 'Walk the perimeter without checking exit positions.', initial_suds_estimate: 8, difficulty_value: 20, difficulty_unit: 'minutes', location_hint: 'Full park' },
    ],
  },
  {
    id: 'tpl_custom',
    goal: 'Custom goal',
    description: 'Define your own exposure ladder from scratch.',
    icon: 'pencil',
    steps: [],
  },
];
